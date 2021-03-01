import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from '@lodash';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import FuseUtils from '@fuse/utils';
import FuseAnimate from '@fuse/core/FuseAnimate';
import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useForm, useDeepCompareEffect } from '@fuse/hooks';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { orange } from '@material-ui/core/colors';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import withReducer from 'app/store/withReducer';
import { saveProduct, newProduct, getProduct } from '../store/productSlice';
import { showMessage } from 'app/store/fuse/messageSlice';
import FuseSplashScreen from '@fuse/core/FuseSplashScreen';
import InputAdornment from '@material-ui/core/InputAdornment';
import reducer from '../store';
import NumberFormat from 'react-number-format';

function NumberFormatCustom(props) {
	const { inputRef, onChange, ...other } = props;
  
	return (
	  <NumberFormat
		{...other}
		getInputRef={inputRef}
		onValueChange={(values) => {
		  onChange({
			target: {
			  name: props.name,
			  value: values.value,
			},
		  });
		}}
		thousandSeparator
	  />
	);
  }

  NumberFormatCustom.propTypes = {
	inputRef: PropTypes.func.isRequired,
	name: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
  };

const useStyles = makeStyles(theme => ({
	productImageFeaturedStar: {
		position: 'absolute',
		top: 0,
		right: 0,
		color: orange[400],
		opacity: 0
	},
	productImageUpload: {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut
	},
	productImageItem: {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut,
		'&:hover': {
			'& $productImageFeaturedStar': {
				opacity: 0.8
			}
		},
		'&.featured': {
			pointerEvents: 'none',
			boxShadow: theme.shadows[3],
			'& $productImageFeaturedStar': {
				opacity: 1
			},
			'&:hover $productImageFeaturedStar': {
				opacity: 1
			}
		}
	}
}));



const getSortData = [
	{
		label:'예배비',
		id:1
	},
	{
		label:'사례비',
		id:2
	},
	{
		label:'활동비',
		id:3
	},
	{
		label:'노회비',
		id:4
	},
	{
		label:'전도비',
		id:5
	},
	{
		label:'관리비',
		id:6
	},
	{
		label:'비품비',
		id:7
	},
	{
		label:'방송비',
		id:8
	},
	{
		label:'차량비',
		id:9
	},
	{
		label:'후생비',
		id:10
	},
	{
		label:'교육비',
		id:11
	},
	{
		label:'홈페이지',
		id:12
	},
	{
		label:'출판비',
		id:13
	},
	{
		label:'양육비',
		id:14
	},
	{
		label:'행정비',
		id:15
	},
	{
		label:'통신비',
		id:16
	},
	{
		label:'친교비',
		id:17
	},
	{
		label:'공과비',
		id:18
	},
	{
		label:'광고비',
		id:19
	},
	{
		label:'판공비',
		id:20
	},
	{
		label:'행사비',
		id:21
	},
	{
		label:'복지비',
		id:22
	},
	{
		label:'경조비',
		id:23
	},
	{
		label:'대출',
		id:24
	},
	{
		label:'건축',
		id:25
	},
	{
		label:'선교비',
		id:26
	},
	{
		label:'구제비',
		id:27
	},
	{
		label:'기타',
		id:28
	},
	{
		label:'개인도서',
		id:29
	}
	
];

function Product(props) {
	const dispatch = useDispatch();
	const product = useSelector(({ eCommerceApp }) => eCommerceApp.product);
	const classes = useStyles(props);
	const routeParams = useParams();
	const theme = useTheme();
	const user = useSelector(({ auth }) => auth.user);
	const [selectedSort, setSelectedSort] = useState(1);
	const [showSpinner, setShowSpinner] = useState(false);
	const { form, handleChange, setForm } = useForm(null);
	const { t } = useTranslation('EcommerceApp');

	useDeepCompareEffect(() => {
		function updateProductState() {
			const { productId } = routeParams;
			if (productId === 'new') {
				dispatch(newProduct());
			} else {
				dispatch(getProduct(routeParams));
			}
		}
		updateProductState();
	}, [dispatch, routeParams]);

	useEffect(() => {
		if ((product && !form) || (product && form && product.id !== form.id)) {
			setForm(product);
		}
	}, [form, product, setForm]);
	function setFeaturedImage(id) {
		setForm(_.set({ ...form }, 'featuredImageId', id));
	}

	function handleUploadChange(e) {
		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onload = () => {
			setForm(
				_.set({ ...form }, `images`, [
					{
						id: FuseUtils.generateGUID(),
						url: `data:${file.type};base64,${btoa(reader.result)}`,
						type: 'image', 
						file
					},
					...form.images
				])	
			);
		};

		reader.onerror = () => {
			console.log('error on load image');
		};
	}

	function canBeSubmitted() {
		// return form.images.length > 0 && !_.isEqual(product, form)
		// return !_.isEqual(product, form)
		if(form.startDate || form.patron || form.contents || form.president || form.amount || form.paid || form.unPaid || form.account || form.personInCharge) {
			return (form.startDate.length > 0 &&
				form.patron.length > 0 &&
				form.contents.length > 0 &&
				form.president.length > 0 &&
				form.amount.length > 0 &&
				form.paid.length > 0 &&
				form.unPaid.length > 0 &&
				form.account.length > 0 &&
				form.personInCharge.length > 0);
		}
	}

	if ((!product || (product && routeParams.productId !== product.id)) && routeParams.productId !== 'new') {
		return <FuseLoading />;
  	}
	
	function handleSelectedSort(event) {
		setSelectedSort(event.target.value);
	}

	async function submitForm() {
		setShowSpinner(true);
		const data = {
			...form,
			amount: parseInt(form.amount),
			sort: getSortData.find(o => o.id === selectedSort).label,
			userId: user.data.userId,
			images: form.images.map(img=>img.file)
		}
		const form_data = new FormData();
		for ( var key in data ) {
			if(key==='images'){
				data[key].map(item=>{
					form_data.append('images', item)
				})
			}else{
				form_data.append(key, data[key]);
			}
		}
		await dispatch(saveProduct(form_data)
		).then((res)=> {
			setShowSpinner(false);
			if (res.payload.responseCode === 201) {
				const { productId } = routeParams;
				if (productId === 'new') {
					dispatch(showMessage({ message: 'Receipt created successfully', variant:'success' }));
				}else{
					dispatch(showMessage({ message: 'Receipt updated successfully', variant:'success' }));
				}
				props.history.push('/apps/receipts');
			}
		}, (err) => {
			setShowSpinner(false);
			if (err.message === 'Request failed with status code 400') {
				dispatch(showMessage({ message: 'Something went wrong! Please try again', variant:'error' }));
			}
		})
	}

	return (
		<FusePageCarded
			classes={{
				toolbar: 'p-0',
				header: 'min-h-72 h-72 sm:h-136 sm:min-h-136'
			}}
			header={
				form && (
					<div className="flex flex-1 w-full items-center justify-between">
						<div className="flex flex-col items-start max-w-full">
							<FuseAnimate animation="transition.slideRightIn" delay={300}>
								<Typography
									className="normal-case flex items-center sm:mb-12"
									component={Link}
									role="button"
									to="/apps/receipts"
									color="inherit"
								>
									<Icon className="text-20">
										{theme.direction === 'ltr' ? 'arrow_back' : 'arrow_forward'}
									</Icon>
									<span className="mx-4">Receipts</span>
								</Typography>
							</FuseAnimate>

							<div className="flex items-center max-w-full">
								<FuseAnimate animation="transition.expandIn" delay={300}>
									{form.images && form.images.length > 0 && form.featuredImageId ? (
										<img
											className="w-32 sm:w-48 rounded"
											src={_.find(form.images, { id: form.featuredImageId }).url}
											alt={form.item}
										/>
									) : (
										<img
											className="w-32 sm:w-48 rounded"
											src="assets/images/ecommerce/product-image-placeholder.png"
											alt={form.item}
										/>
									)}
								</FuseAnimate>
								<div className="flex flex-col min-w-0 mx-8 sm:mc-16">
									<FuseAnimate animation="transition.slideLeftIn" delay={300}>
										<Typography className="text-16 sm:text-20 truncate">
											{form.contents ? 'Edit Receipt' : 'New Receipt'}
										</Typography>
									</FuseAnimate>
								</div>
							</div>
						</div>
						<FuseAnimate animation="transition.slideRightIn" delay={300}>
							<Button
								className="whitespace-no-wrap normal-case"
								variant="contained"
								color="secondary"
								disabled={!canBeSubmitted()}
								onClick={() => submitForm()}
							>
								Save
							</Button>
						</FuseAnimate>
					</div>
				)
			}
			content={
				form && (
						<div className="p-16 sm:p-24 max-w-2xl">
							{showSpinner && <FuseSplashScreen />}
							<div className="flex -mx-4">
								<TextField
									className="mt-8 mb-16 mx-4"
									name="startDate"
									label={t('START_DATE')}
									type="date"
									InputLabelProps={{
										shrink: true
									}}
									value={form.startDate}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
								<FormControl className="flex w-full mt-8 mb-16 sm:w-420 mx-4" variant="outlined">
									<InputLabel htmlFor="category-label-placeholder">{t('SORT')} </InputLabel>
									<Select
										value={selectedSort || ""}
										onChange={handleSelectedSort}
										input={
											<OutlinedInput
												labelWidth={'sort'.length * 9}
												name="sort"
												id="category-label-placeholder"
											/>
										}
									>
										{getSortData.map(sort => (
											<MenuItem value={sort.id} key={sort.id}>
												{sort.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</div>

							<div className="flex -mx-4">
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('SORT_SUB')}
									autoFocus
									id="sortSub"
									name="sortSub"
									value={form.sortSub}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('PATRON')}
									autoFocus
									id="patron"
									name="patron"
									value={form.patron}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
							</div>
							<TextField
								className="mt-8 mb-16"
								required
								label={t('CONTENTS')}
								autoFocus
								id="contents"
								name="contents"
								value={form.contents}
								onChange={handleChange}
								variant="outlined"
								fullWidth
							/>
							<div className="flex -mx-4">
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('PRESIDENTS')}
									autoFocus
									id="president"
									name="president"
									value={form.president}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('AMOUNT')}
									autoFocus
									id="amount"
									name="amount"
									value={form.amount}
									variant="outlined"
									fullWidth
									InputProps={{
										startAdornment: <InputAdornment position="start">￦</InputAdornment>,
										inputComponent: NumberFormatCustom,
									}}
									onChange={handleChange}
								/>
							</div>
							<div className="flex -mx-4">
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('PAID')}
									autoFocus
									id="paid"
									name="paid"
									value={form.paid}
									InputProps={{
										startAdornment: <InputAdornment position="start">￦</InputAdornment>,
										inputComponent: NumberFormatCustom,
									}}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('UNPAID')}
									autoFocus
									id="unPaid"
									name="unPaid"
									InputProps={{
										startAdornment: <InputAdornment position="start">￦</InputAdornment>,
										inputComponent: NumberFormatCustom,
									}}
									value={form.unPaid}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
							</div>
							<div className="flex -mx-4">
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('ACCOUNT')}
									autoFocus
									id="account"
									name="account"
									value={form.account}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
								<TextField
									className="mt-8 mb-16 mx-4"
									required
									label={t('PERSON_IN_CHARGE')}
									autoFocus
									id="personInCharge"
									name="personInCharge"
									value={form.personInCharge}
									onChange={handleChange}
									variant="outlined"
									fullWidth
								/>
							</div>
							<TextField
								className="mt-8 mb-16"
								label={t('MEMO')}
								id="memo"
								name="memo"
								value={form.memo}
								onChange={handleChange}
								variant="outlined"
								fullWidth
							/>

                            
							<div className="flex justify-center sm:justify-start flex-wrap -mx-8">
								<label
									htmlFor="button-file"
									className={clsx(
										classes.productImageUpload,
										'flex items-center justify-center relative w-128 h-128 rounded-8 mx-8 mb-16 overflow-hidden cursor-pointer shadow-1 hover:shadow-5'
									)}
								>
									<input
										accept="image/*"
										className="hidden"
										id="button-file"
										type="file"
										onChange={handleUploadChange}
									/>
									<Icon fontSize="large" color="action">
										cloud_upload
									</Icon>
								</label>
								{form.images && form.images.map(media => (
									<div
										onClick={() => setFeaturedImage(media.id)}
										onKeyDown={() => setFeaturedImage(media.id)}
										role="button"
										tabIndex={0}
										className={clsx(
											classes.productImageItem,
											'flex items-center justify-center relative w-128 h-128 rounded-8 mx-8 mb-16 overflow-hidden cursor-pointer shadow-1 hover:shadow-5',
											media.id === form.featuredImageId && 'featured'
										)}
										key={media.id}
									>
										<Icon className={classes.productImageFeaturedStar}>star</Icon>
										<img className="max-w-none w-auto h-full" src={media.url} alt="product" />
									</div>
								))}
							</div>

							
						</div>
				)
			}
			innerScroll
		/>
	);
}

export default withReducer('eCommerceApp', reducer)(Product);
