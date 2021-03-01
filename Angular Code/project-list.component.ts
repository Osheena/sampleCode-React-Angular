import { PlatformLocation } from '@angular/common';
import {Component, Input, OnInit, HostBinding, ChangeDetectorRef, OnDestroy} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CreateRenameComponent } from 'app/shared/components/create-rename-modal/create-rename-modal.component';
import { NotifyService } from 'app/shared/services/notification.service';
import { RequestFactory } from 'app/shared/services/request.factory';
import { UserAccessService } from 'app/shared/services/user-access.service';
import * as fromProjectsUserPerms from 'app/shared/store/projects-user-permissions/projects-user-permissions.action';
import * as fromRoot from 'app/shared/store/reducers';
import { dfNoOnlyWhitespacesValidator } from 'app/shared/validators/no-only-whitespaces.validator';
import { projectNameValidator } from 'app/shared/validators/project-name.validator';
import {take, takeUntil} from 'rxjs/operators';
import {ProjectListService} from './project-list.service';

import { DashboardService } from '../dashboard.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {componentDestroyed} from 'app/shared/helpers';
declare var document: any;
@Component({
  selector: 'df-project-list',
  templateUrl: 'project-list.component.html',
  styleUrls: ['./project-list.component.scss'],
  animations: [
    trigger('isCollapsed', [
      state('true', style({width: '60px', minWidth: 0})),
      state('false', style({width: '*', minWidth: '*'})),
      transition('1 <=> 0', [
        animate(1000),
      ]),
    ]),
  ],
})

export class ProjectListComponent implements OnInit, OnDestroy {
  @Input() public projects: any[];
  @Input() public basicInfoCompanyId;
  @Input() public isMobile: boolean = false;

  isCollapsed: boolean;

  private modalRef;

  constructor(private modalService: NgbModal,
              private store: Store<fromRoot.State>,
              private dashboardService: DashboardService,
              public userAccessService: UserAccessService,
              private requestService: RequestFactory,
              private translation: TranslateService,
              private notification: NotifyService,
              private router: Router,
              private location: PlatformLocation,
              private cd: ChangeDetectorRef,
              private service: ProjectListService,
  ) {
  }

  ngOnDestroy() {
  }

  ngOnInit() {
    this.location.onPopState(() => {
      if (this.modalRef) {
        this.modalRef.close();
        this.modalRef = null;
      }
    });
    this.service.isCollapsed$
      .pipe(takeUntil(componentDestroyed(this)))
      .subscribe((isCollapsed) => {
        this.isCollapsed = isCollapsed;
        this.cd.detectChanges();
      });
    this.setIntialState();
  }

  public createProjectModal(): void {
    const formControl = new FormControl(
      '',
      [
        Validators.required,
        dfNoOnlyWhitespacesValidator,
      ],
      projectNameValidator(this.requestService),
    );
    this.modalRef = this.modalService.open(
      CreateRenameComponent,
      {backdrop: 'static', windowClass: 'modal-parent'},
    );
    this.modalRef.componentInstance.errorTemplateName = 'project-name';
    this.modalRef.componentInstance.headerLabel = 'PROJECTS.CREATE_PROJECT';
    this.modalRef.componentInstance.type = 'create';
    this.modalRef.componentInstance.control = formControl;
    this.modalRef.componentInstance.inputLabel = 'DASHBOARD.PROJECT_NAME';
    this.modalRef.componentInstance.maxLength = 80;
    this.modalRef.result.then(() => {
        this.dashboardService.loadProjects();
      },
      () => {
      });
    this.modalRef.componentInstance.formSubmit
      .pipe(take(1))
      .subscribe((submit) => {
        if (submit) {
          this.translation.get([
            'NOTIFICATIONS.ERROR',
            'PROJECTS.FAILED_CREATE_PROJECT',
          ]).subscribe((translations) => {
            this.modalRef.componentInstance.isShowSpinner = true;
            this.requestService.createProject(this.modalRef.componentInstance.control.value).subscribe((data) => {
              this.requestService.getProjectsUserPermissions().subscribe((response) => {
                this.store.dispatch(new fromProjectsUserPerms.LoadSuccessAction(response.data));
                this.router.navigate(['/projects/project', data.id]);
                this.modalRef.close();
              });
            }, () => {
              this.modalRef.componentInstance.isShowSpinner = false;
              this.notification.error(translations['NOTIFICATIONS.ERROR'],
                translations['PROJECTS.FAILED_CREATE_PROJECT']);
            });
          });
        }
      });
  }

  public pin(projectId: number): void {
    this.dashboardService.pinProject(projectId).subscribe(() => {
      this.dashboardService.getProjectsWithPermission();
      this.dashboardService.getPinnedProjects();
      this.dashboardService.loadSummary();
    });
  }

  public unpin(projectId: number): void {
    this.dashboardService.unpinProject(projectId).subscribe(() => {
      this.dashboardService.getProjectsWithPermission();
      this.dashboardService.getPinnedProjects();
    });
  }

  toggle() {
    const sidenav = document.getElementsByClassName('sidenav')[0];
    if (this.isCollapsed) {
      sidenav.classList.remove('active');
    } else {
      sidenav.classList.add('active');

    }
    this.isCollapsed = !this.isCollapsed;
    this.service.setCollapsedState(this.isCollapsed);
  }
   setIntialState() {
    const sidenav = document.getElementsByClassName('sidenav')[0];
    if (this.isCollapsed) {
          sidenav.classList.add('active');
    } else {
          sidenav.classList.remove('active');
    }
   }
}
