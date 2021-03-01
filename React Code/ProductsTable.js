import FuseScrollbars from '@fuse/core/FuseScrollbars';
import _ from '@lodash';
import Checkbox from '@material-ui/core/Checkbox';
import Icon from '@material-ui/core/Icon';
import Table from '@material-ui/core/Table';
import Button from '@material-ui/core/Button';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { getProducts, selectProducts, performAction } from '../store/productsSlice';
import ProductsTableHead from './ProductsTableHead';
import moment from 'moment';
import { showMessage } from 'app/store/fuse/messageSlice';
import Tooltip from '@material-ui/core/Tooltip';
import { useForm } from '@fuse/hooks';
import TextField from '@material-ui/core/TextField';
import FuseAnimate from '@fuse/core/FuseAnimate';
import ExcelExport from '../../../../components/ExcelExport'
import axios from 'axios';

const defaultFormState = {
	startDate: new Date().setDate(new Date().getDate() - 7),
	dueDate: new Date()
};
function ProductsTable(props) {
	const dispatch = useDispatch();
	const products = useSelector(selectProducts);
	const userId = useSelector(({ auth }) => auth.user.data.userId);
	const searchText = useSelector(({ eCommerceApp }) => eCommerceApp.products.searchText);
	const { form, handleChange } = useForm({ ...defaultFormState });
	const startDate = moment(form.startDate).format('YYYY-MM-DD')
	const dueDate = moment(form.dueDate).format('YYYY-MM-DD')
	const [applyfilters, setApplyFilters] = useState(false)
	const [selected, setSelected] = useState([]);
	const [data, setData] = useState(products);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [order, setOrder] = useState({
		direction: 'asc',
		id: null
	});

	useEffect(() => {
		if (searchText.length !== 0) {
			setData(_.filter(products, item => 
				item.contents.toLowerCase().includes(searchText.toLowerCase()) ||
				item.account.toLowerCase().includes(searchText.toLowerCase()) ||
				item.category.toLowerCase().includes(searchText.toLowerCase()) ||
				item.item.toLowerCase().includes(searchText.toLowerCase()) ||
				item.memo.toLowerCase().includes(searchText.toLowerCase()) ||
				item.patron.toLowerCase().includes(searchText.toLowerCase()) ||
				item.sort.toLowerCase().includes(searchText.toLowerCase()) ||
				item.person_in_charge.toLowerCase().includes(searchText.toLowerCase())
				));
			setPage(0);
		} else {
			setData(products);
		}
	}, [products, searchText]);

	function handleRequestSort(event, property) {
		const id = property;
		let direction = 'desc';

		if (order.id === property && order.direction === 'desc') {
			direction = 'asc';
		}

		setOrder({
			direction,
			id
		});
	}

	function handleSelectAllClick(event) {
		if (event.target.checked) {
			setSelected(data.map(n => n.id));
			return;
		}
		setSelected([]);
	}

	const handleDownload = () => {
		let type = 'approve'
		axios({
			url: '/api/receipts/download-receipts',
			params:{userId,type,selected},
			method: 'GET',
			responseType: 'blob',
		  }).then((response) => {
			 const url = window.URL.createObjectURL(new Blob([response.data]));
			 const link = document.createElement('a');
			 link.href = url;
			 link.setAttribute('download', 'list.xlsx');
			 document.body.appendChild(link);
			 link.click();
		  });
	}

	function handleClick(item) {
		props.history.push(`/apps/receipts/${item.id}/${item.contents}`);
	}

	function handleCheck(event, id) {
		const selectedIndex = selected.indexOf(id);
		let newSelected = [];

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, id);
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1));
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1));
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
		}

		setSelected(newSelected);
	}

	function performanceNavigation(typeOfAction, id) {
		let actionStatus;
		if (typeOfAction === 'approve') {
			actionStatus = 1;
		} else if (typeOfAction === 'deny') {
			actionStatus = 2;
		} else {
			actionStatus = -1;
		}
		var data = {
			id: id,
			status: actionStatus
		}
		dispatch(performAction(data))
			.then((res) => {
				if (res.payload.responseCode === 201) {
					dispatch(showMessage({ message: res.payload.message }));
					dispatch(getProducts());
				}
			}, (err) => {
				if (err.message === 'Request failed with status code 400') {
					dispatch(showMessage({ message: 'Something went wrong! Please try again' }));
				}
			});
	}

	function handleChangePage(event, value) {
		setPage(value);
	}

	function handleChangeRowsPerPage(event) {
		setRowsPerPage(event.target.value);
	}
	const modifyfilters = (e) => {
		handleChange(e)
	}

	return (
		<div className="w-full flex flex-col">
			<div className="flex flex-1 mx-4 mt-4 w-full items-center justify-between">
				<div className="flex mx-4 items-center justify-between">
					<TextField
						name="startDate"
						label="Start Date"
						type="date"
						className="mt-8 mb-4 mx-4"
						InputLabelProps={{
							shrink: true
						}}
						inputProps={{
							max: dueDate
						}}
						margin="dense"
						value={startDate}
						onChange={e => modifyfilters(e)}
						variant="outlined"
					/>
					<TextField
						name="dueDate"
						label="End Date"
						type="date"
						className="mt-8 mb-4 mx-4"
						InputLabelProps={{
							shrink: true
						}}
						inputProps={{
							min: startDate
						}}
						margin="dense"
						value={dueDate}
						onChange={e => modifyfilters(e)}
						variant="outlined"
					/>
					<FuseAnimate animation="transition.slideRightIn" delay={300}>
						<Button
							component={Button}
							className="whitespace-no-wrap normal-case mx-8 mt-4 ml-4 mr-2"
							variant="contained"
							color="secondary"

							onClick={() => { setApplyFilters(true) }}
						>
							<span className="hidden sm:flex">Apply</span>
							<span className="flex sm:hidden">Apply</span>
						</Button>

					</FuseAnimate>
					<FuseAnimate animation="transition.slideRightIn" delay={300}>
						<Button
							component={Button}
							className="whitespace-no-wrap normal-case mx-8 mt-4 ml-4 mr-2"
							variant="contained"
							color="secondary"
							onClick={() => { setApplyFilters(false) }}
						>
							<span className="hidden sm:flex">Clear</span>
							<span className="flex sm:hidden">Clear</span>
						</Button>
					</FuseAnimate>
				</div>
				<FuseAnimate animation="transition.slideRightIn" delay={300}>
						<Button
							component={Button}
							className="whitespace-no-wrap normal-case"
							variant="contained"
							color="secondary"
							onClick={handleDownload}
						>
							<span className="hidden sm:flex">Download</span>
							<span className="flex sm:hidden">Download</span>
						</Button>
				</FuseAnimate>
			</div>
			<FuseScrollbars className="flex-grow overflow-x-auto">
				<Table stickyHeader className="min-w-xl" aria-labelledby="tableTitle">
					<ProductsTableHead
						numSelected={selected.length}
						order={order}
						onSelectAllClick={handleSelectAllClick}
						onRequestSort={handleRequestSort}
						rowCount={data.length}
					/>

					<TableBody>
						{_.orderBy(
							data,
							[
								o => {
									switch (order.id) {
										case 'categories': {
											return o.categories[0];
										}
										default: {
											return o[order.id];
										}
									}
								}
							],
							[order.direction]
						)
							.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
							.filter(item => {
								if (applyfilters) {
									return item.startDate >= startDate && item.startDate < dueDate
								}
								return true
							})
							.map(n => {
								const isSelected = selected.indexOf(n.id) !== -1;
								return (
									<TableRow
										className="h-64 cursor-pointer"
										hover
										role="checkbox"
										aria-checked={isSelected}
										tabIndex={-1}
										key={n.id}
										selected={isSelected}
										onClick={()=>handleClick(n)}
									>
										<TableCell className="w-40 md:w-64 text-center" padding="none">
											<Checkbox
												checked={isSelected}
												onClick={event => event.stopPropagation()}
												onChange={event => handleCheck(event, n.id)}
												disabled={n.status === -1}
											/>
										</TableCell>

										<TableCell className="p-4 md:p-16" component="th" scope="row">
											{moment(n.startDate).format('D/MM/YYYY')}
										</TableCell>

										<TableCell className="p-4 md:p-16 truncate" component="th" scope="row">
											{n.sort}
										</TableCell>

										<TableCell className="p-4 md:p-16 truncate" component="th" scope="row">
											{n.sortsub}
										</TableCell>

										<TableCell className="p-4 md:p-16" component="th" scope="row">
											{n.contents}
										</TableCell>

										<TableCell className="p-4 md:p-16" component="th" scope="row"> {/* align="right" */}
											<span>￦</span>
											{n.amount}
										</TableCell>

										<TableCell className="p-4 md:p-16 truncate" component="th" scope="row">
											<span>￦</span>
											{n.paid}
										</TableCell>

										<TableCell className="p-4 md:p-16" component="th" scope="row">
											<span>￦</span>
											{n.unpaid}
										</TableCell>

										<TableCell className="p-4 md:p-16 truncate" component="th" scope="row">
											{n.account}
										</TableCell>

										<TableCell className="p-4 md:p-16 truncate" component="th" scope="row">
											{n.person_in_charge}
										</TableCell>

										<TableCell className="p-4 md:p-16" component="th" scope="row">
											{n.status === 1 &&
												<Tooltip title="Approved">
													<Icon className="text-green text-20 action">check_circle</Icon>
												</Tooltip>
											}
											{n.status === 2 &&
												<Tooltip title="Deny">
													<Icon className="text-gray text-20 action">cancel_circle</Icon>
												</Tooltip>
											}
											{n.status === 0 &&
												<Icon className="text-red text-20 action">remove_circle</Icon>
											}
										</TableCell>

										<TableCell className="p-4 md:p-16" component="th" scope="row">
											{n.status !== -1 && <div>
												<Icon
													onClick={() => performanceNavigation('approve', n.id)}
													className="text-green text-20 mx-2"
												>
													thumb_up
												</Icon>
												<Icon
													onClick={() => performanceNavigation('deny', n.id)}
													className="text-gray text-20 mx-2"
												>
													thumb_down
												</Icon>
												<Icon
													onClick={() => performanceNavigation('delete', n.id)}
													className="text-red text-20 mx-2"
												>
													delete
												</Icon>
											</div>}
										</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</FuseScrollbars>

			<TablePagination
				className="flex-shrink-0 border-t-1"
				component="div"
				count={data.length}
				rowsPerPage={rowsPerPage}
				page={page}
				backIconButtonProps={{
					'aria-label': 'Previous Page'
				}}
				nextIconButtonProps={{
					'aria-label': 'Next Page'
				}}
				onChangePage={handleChangePage}
				onChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</div>
	);
}

export default withRouter(ProductsTable);
