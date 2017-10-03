import React, {Component} from 'react'
import API from 'api'
import dict from 'dictionary'
import autobind from 'autobind-decorator'
import {Button} from 'react-bootstrap'

import BarChart from 'components/BarChart'
import Fieldset from 'components/Fieldset'
import ReportCollection from 'components/ReportCollection'


const d3 = require('d3')
const colors = {
  barColor: '#F5CA8D',
  selectedBarColor: '#EC971F'
}
const chartByOrgId = 'cancelled_reports_by_org'
const chartByReasonId = 'cancelled_reports_by_reason'


/*
 * Component displaying a chart with reports cancelled since
 * the given date.
 */
export default class CancelledReports extends Component {
  static propTypes = {
    date: React.PropTypes.object,
  }

  constructor(props) {
    super(props)

    this.state = {
      date: props.date,
      graphDataByOrg: [],
      graphDataByReason: [],
      focusedOrg: ''
    }
  }

  render() {
    let chartByOrg = ''
    let chartByReason = ''
    if (this.state.graphDataByOrg.length) {
      chartByOrg = <BarChart
        chartId={chartByOrgId}
        data={this.state.graphDataByOrg}
        xProp='advisorOrg.id'
        yProp='cancelledByOrg'
        xLabel='advisorOrg.shortName'
        onBarClick={this.goToOrg}
        barColor={colors.barColor}
      />
      chartByReason = <BarChart
        chartId={chartByReasonId}
        data={this.state.graphDataByReason}
        xProp='reason'
        yProp='cancelledByReason'
        barColor={colors.barColor}
      />
    }
    return (
      <div>
        {chartByOrg}
        {chartByReason}
        <Fieldset
            title={`Cancelled reports ${this.state.focusedOrg ? `for ${this.state.focusedOrg.shortName}` : ''}`}
            id='cancelled-reports-details'
            action={!this.state.focusedOrg
              ? '' : <Button onClick={() => this.goToOrg()}>All organizations</Button>
            }
          >
          <ReportCollection paginatedReports={this.state.reports} goToPage={this.goToReportsPage} />
        </Fieldset>
      </div>
    )
  }

  fetchData() {
    let pinned_ORGs = dict.lookup('pinned_ORGs')
    const commonQueryParams = {
      state: ['CANCELLED'],
      releasedAtStart: this.state.date.valueOf(),
    }
    const chartQueryParams = {}
    Object.assign(chartQueryParams, commonQueryParams)
    Object.assign(chartQueryParams, {
      pageSize: 0,  // retrieve all the filtered reports
    })
    // Query used by the chart
    let chartQuery = API.query(/* GraphQL */`
        reportList(f:search, query:$chartQueryParams) {
          totalCount, list {
            ${ReportCollection.GQL_REPORT_FIELDS}
          }
        }
      `, {chartQueryParams}, '($chartQueryParams: ReportSearchQuery)')
    Promise.all([chartQuery]).then(values => {
      this.setState({
        graphDataByOrg: values[0].reportList.list
        .filter((item, index, d) => d.findIndex(t => {return t.advisorOrg.id === item.advisorOrg.id }) === index)
        .map(d => {d.cancelledByOrg = values[0].reportList.list.filter(item => item.advisorOrg.id === d.advisorOrg.id).length; return d})
        .sort((a, b) => {
          let a_index = pinned_ORGs.indexOf(a.advisorOrg.shortName)
          let b_index = pinned_ORGs.indexOf(b.advisorOrg.shortName)
          if (a_index < 0)
            return (b_index < 0) ?  a.advisorOrg.shortName.localeCompare(b.advisorOrg.shortName) : 1
          else
            return (b_index < 0) ? -1 : a_index-b_index
        }),
        graphDataByReason: values[0].reportList.list
          .filter((item, index, d) => d.findIndex(t => {return t.cancelledReason === item.cancelledReason }) === index)
          .map(d => {d.cancelledByReason = values[0].reportList.list.filter(item => item.cancelledReason === d.cancelledReason).length; return d})
          .map(d => {d.reason = d.cancelledReason.replace("CANCELLED_", "").replace(/_/g, " ").toLocaleLowerCase().replace(/(\b\w)/gi, function(m) {return m.toUpperCase()}); return d})
          .sort((a, b) => {
            return a.reason.localeCompare(b.reason)
        })
      })
    })
    this.fetchOrgData()
  }

  fetchOrgData() {
    const commonQueryParams = {
      state: ['CANCELLED'],
      releasedAtStart: this.state.date.valueOf(),
    }
    const reportsQueryParams = {}
    Object.assign(reportsQueryParams, commonQueryParams)
    Object.assign(reportsQueryParams, {pageNum: this.state.reportsPageNum})
    if (this.state.focusedOrg) {
      Object.assign(reportsQueryParams, {advisorOrgId: this.state.focusedOrg.id})
    }
    // Query used by the reports collection
    let reportsQuery = API.query(/* GraphQL */`
        reportList(f:search, query:$reportsQueryParams) {
          pageNum, pageSize, totalCount, list {
            ${ReportCollection.GQL_REPORT_FIELDS}
          }
        }
      `, {reportsQueryParams}, '($reportsQueryParams: ReportSearchQuery)')
    Promise.all([reportsQuery]).then(values => {
      this.setState({
        reports: values[0].reportList
      })
    })
  }

  @autobind
  goToReportsPage(newPage) {
    this.setState({reportsPageNum: newPage}, () => this.fetchOrgData())
  }

  resetChartSelection(chartId) {
    d3.selectAll('#' + chartId + ' rect').attr('fill', colors.barColor)
  }

  @autobind
  goToOrg(item) {
    this.setState({reportsPageNum: 0, focusedOrg: (item ? item.advisorOrg : '')}, () => this.fetchOrgData())
    // remove highlighting of the bars
    this.resetChartSelection(chartByOrgId)
    if (item) {
      // highlight the bar corresponding to the selected organisation
      d3.select('#' + chartByOrgId + ' #bar_' + item.advisorOrg.id).attr('fill', colors.selectedBarColor)
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps !== this.props) {
      this.setState({date: nextProps.date})
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.date.valueOf() !== this.state.date.valueOf()) {
      this.fetchData()
    }
  }
}
