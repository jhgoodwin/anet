import React from 'react'
import Page, {mapDispatchToProps, propTypes as pagePropTypes} from 'components/Page'

import Breadcrumbs from 'components/Breadcrumbs'
import RelatedObjectNotes, {GRAPHQL_NOTES_FIELDS} from 'components/RelatedObjectNotes'

import AuthorizationGroupForm from './Form'
import {AuthorizationGroup} from 'models'

import API from 'api'

import { PAGE_PROPS_NO_NAV } from 'actions'
import { connect } from 'react-redux'

class AuthorizationGroupEdit extends Page {

	static propTypes = {
		...pagePropTypes,
	}

	state = {
		authorizationGroup: new AuthorizationGroup(),
	}

	constructor(props) {
		super(props, PAGE_PROPS_NO_NAV)
	}

	fetchData(props) {
		return API.query(/* GraphQL */`
				authorizationGroup(uuid:"${props.match.params.uuid}") {
				uuid, name, description
				positions { uuid, name, code, type, status, organization { uuid, shortName}, person { uuid, name } }
				status
				${GRAPHQL_NOTES_FIELDS}
			}
		`).then(data => {
			this.setState({
				authorizationGroup: new AuthorizationGroup(data.authorizationGroup),
			})
		})
	}

	render() {
		const { authorizationGroup } = this.state
		return (
			<div>
				<RelatedObjectNotes notes={authorizationGroup.notes} relatedObject={authorizationGroup.uuid && {relatedObjectType: 'authorizationGroups', relatedObjectUuid: authorizationGroup.uuid}} />
				<Breadcrumbs items={[[`Authorization Group ${authorizationGroup.name}`, AuthorizationGroup.pathFor(authorizationGroup)], ["Edit", AuthorizationGroup.pathForEdit(authorizationGroup)]]} />
				<AuthorizationGroupForm edit initialValues={authorizationGroup} title={`Authorization Group ${authorizationGroup.name}`} />
			</div>
		)
	}
}

export default connect(null, mapDispatchToProps)(AuthorizationGroupEdit)
