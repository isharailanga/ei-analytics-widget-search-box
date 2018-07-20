import Widget from '@wso2-dashboards/widget';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class SearchBox extends Widget {

  constructor(props) {
    super(props);
    this.state = {
      selectedOption: '',
      optionArray: []
    }
    this.publishedMsgSet = [];
    this.handleChange = this.handleChange.bind(this);
    this.handleDataReceived = this.handleDataReceived.bind(this);
    this.getCurrentPage = this.getCurrentPage.bind(this);

  }

  getCurrentPage() {
    var pageName;
    var href = parent.window.location.href;
    var lastSegment = href.substr(href.lastIndexOf('/') + 1);
    if (lastSegment.indexOf('?') == -1) {
      pageName = lastSegment;
    } else {
      pageName = lastSegment.substr(0, lastSegment.indexOf('?'));
    }
    return pageName;
  }

  componentDidMount() {

    let query;
    let pgAPI = 'api'; let pgEndpoint = 'endpoint'; let pgProxy = 'proxy';
    let pageName = this.getCurrentPage();

    super.getWidgetConfiguration(this.props.widgetID)
      .then((message) => {
        if (pageName == pgAPI || pageName == pgProxy || pageName == pgEndpoint) {
          query = message.data.configs.providerConfig.configs.config.queryData.queryESB;
        } else {
          query = message.data.configs.providerConfig.configs.config.queryData.queryMediator;
        }
        message.data.configs.providerConfig.configs.config.queryData.query = query.replace('{{paramComponentType}}', '\'' + pageName + '\'');
        super.getWidgetChannelManager().subscribeWidget(this.props.id, this.handleDataReceived, message.data.configs.providerConfig);
      })
      .catch((error) => {
        this.setState({
          faultyProviderConf: true
        });
      });
  }

  handleDataReceived(data) {
    this.setState({
      optionArray: data.data.map(suggestion => ({
        value: suggestion[0],
        label: suggestion[0],
      }))
    });
  }


  handleChange(event) {
    if (event) {
      let selectedValue = event.value;
      let selectedComponent = { "selectedComponent": selectedValue };
      this.setState({ selectedOption: selectedValue });
      this.publishedMsgSet.push({ time: new Date(), value: selectedValue });
      super.publish(selectedComponent);
    }
  }


  render() {
    return (
      <div>
        <Select
          name="form-field-name"
          onChange={this.handleChange}
          options={this.state.optionArray}
          placeholder={this.state.selectedOption}
          value={this.state.selectedOption}
        >
        </Select>
      </div>

    );
  }

}

global.dashboard.registerWidget('SearchBox', SearchBox);
