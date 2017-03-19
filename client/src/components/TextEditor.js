import React, {Component} from 'react'

import AlloyEditor from 'alloyeditor/dist/alloy-editor/alloy-editor-no-react'
import 'alloyeditor/dist/alloy-editor/assets/alloy-editor-atlas.css'

AlloyEditor.Selections[3].buttons.splice(4, 2)

const ALLOY_CONFIG = {
	toolbars: {
		styles: { selections: AlloyEditor.Selections },
		add: { buttons: ['ul', 'ol', 'hline', 'table'] },
	}
}

export default class TextEditor extends Component {
	componentDidMount() {
		this.editor = AlloyEditor.editable(this.container, ALLOY_CONFIG)

		this.componentWillReceiveProps(this.props)
	}

	componentWillUnmount() {
		this.editor.destroy()
	}

	componentWillReceiveProps(newProps) {
		this.container.innerHTML = newProps.value
	}

	render() {
		return <div>
			<div className="text-editor" ref={(el) => { this.container = el }} />
		</div>
	}
}
