import React from 'react'
import utils from 'utils'
import {FormGroup, Col, ControlLabel, FormControl, InputGroup, HelpBlock, ButtonGroup, Button} from 'react-bootstrap'

const getFieldId = field => (
	field.id || field.name  // name property is required
)

const getHumanValue = (field, humanValue) => {
	if (typeof humanValue === 'function') {
		return humanValue(field.value)
	} else if (humanValue !== undefined) {
		return humanValue
	} else {
		return field.value
	}
}

const getFormGroupValidationState = (field, form) => {
	const {touched, errors} = form
	const fieldTouched = touched[field.name]
	const fieldError = errors[field.name]
	const fieldWarning = null
	return (fieldTouched && (fieldError ? 'error' : fieldWarning ? 'warning': null)) || null
}

const getHelpBlock = (field, form) => {
	const {touched, errors} = form
	const fieldTouched = touched[field.name]
	const fieldError = errors[field.name]
	const fieldWarning = null
	return (fieldTouched && (fieldError || fieldWarning) &&
		<HelpBlock>
			{fieldTouched && (fieldError ? fieldError: fieldWarning)}
		</HelpBlock>
	)
}

const renderFieldNoLabel = (field, form, widgetElem, children) => {
	const id = getFieldId(field)
	const validationState = getFormGroupValidationState(field, form)
	return (
		<FormGroup controlId={id} validationState={validationState}>
			{widgetElem}
			{getHelpBlock(field, form)}
			{children}
		</FormGroup>
	)
}

const renderField = (field, label, form, widgetElem, children, extraColElem, addon, horizontal) => {
	if (label === undefined) {
		label = utils.sentenceCase(field.name) // name is a required prop of field
	}
	if (horizontal === undefined) {
		horizontal = true  // default direction of label and input
	}
	let widget
	if (!addon) {
		widget = widgetElem
	} else {
		// allows passing a url for an image
		if (addon.indexOf('.') !== -1) {
			addon = <img src={addon} height={20} alt="" />
		}
		const focusElement = () => {
			const element = document.getElementById(id)
			if (element && element.focus) {
				element.focus()
			}
		}
		widget = <InputGroup>
			{widgetElem}
			<InputGroup.Addon onClick={focusElement}>{addon}</InputGroup.Addon>
		</InputGroup>
	}
	const id = getFieldId(field)
	const validationState = getFormGroupValidationState(field, form)

	// setting label or extraColElem explicitly to null will completely remove these columns!
	const widgetWidth = 12 - (label === null ? 0 : 2) - (extraColElem === null ? 0 : 3)
	// controlId prop of the FormGroup sets the id of the control element
	return (
		<FormGroup controlId={id} validationState={validationState}>
			{horizontal ?
				<React.Fragment>
					{label !== null && <Col sm={2} componentClass={ControlLabel}>{label}</Col>}
					<Col sm={widgetWidth}>
						<div>
							{widget}
							{getHelpBlock(field, form)}
							{children}
						</div>
					</Col>
				</React.Fragment>
			:
				<React.Fragment>
					{label !== null && <ControlLabel>{label}</ControlLabel>}
					{widget}
					{getHelpBlock(field, form)}
					{children}
				</React.Fragment>
			}
			{extraColElem && <Col sm={3} {...extraColElem.props} />}
		</FormGroup>
	)
}

export const renderInputField = ({
  field, // { name, value, onChange, onBlur }
  form, // contains, touched, errors, values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => {
	const {label, children, extraColElem, addon, horizontal, ...otherProps} = props
	const widgetElem = <FormControl {...field} {...otherProps} />
	return renderField(field, label, form, widgetElem, children, extraColElem, addon, horizontal)
}

export const renderInputFieldNoLabel = ({
  field, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => {
	const {children, ...otherProps} = props
	const widgetElem = <FormControl {...field} {...otherProps} />
	return renderFieldNoLabel(field, form, widgetElem, children)
}

export const renderReadonlyField = ({
  field, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => {
	const {label, children, extraColElem, addon, horizontal, humanValue, ...otherProps} = props
	const widgetElem = <FormControl.Static componentClass={'div'} {...field} {...otherProps}>{getHumanValue(field, humanValue)}</FormControl.Static>
	return renderField(field, label, form, widgetElem, children, extraColElem, addon, horizontal)
}

export const renderValue = ({
  field, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => {
	const id = field.id || field.name
	return <FormControl.Static componentClass={'span'} id={id}>{getHumanValue(field)}</FormControl.Static>
}

export const renderSpecialField = ({
  field, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => {
	const {label, children, extraColElem, addon, horizontal, widget, ...otherProps} = props
	const widgetElem = React.cloneElement(widget, {...field, ...otherProps})
	return renderField(field, label, form, widgetElem, children, extraColElem, addon, horizontal)
}

export const renderButtonToggleGroup = ({
  field, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => {
	const {label, children, extraColElem, addon, horizontal, buttons, ...otherProps} = props
	const widgetElem = (
		<ButtonGroup {...otherProps}>
			{buttons.map((button, index) => {
				if (!button) { return null }
				const {label, ...props} = button
				return (
					<Button
						{...props}
						name={field.name}
						key={button.value}
						active={field.value === button.value}
						onBlur={field.onBlur}
						onClick={field.onChange}
					>
							{label}
					</Button>
				)
			})}
		</ButtonGroup>
	)
	return renderField(field, label, form, widgetElem, children, extraColElem, addon, horizontal)
}

export const renderToggleButton = ({
  field, // { name, value, onChange, onBlur }
  form, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => {
	const {labels, children, ...otherProps} = props
	delete field.onBlur // the onBlur would change the value from boolean to string
	const widgetElem = <Button
		{...field} {...otherProps}>{labels[field.value]}</Button>
	return renderFieldNoLabel(field, form, widgetElem, children)
}

export default renderField
