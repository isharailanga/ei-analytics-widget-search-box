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
    this.getUrlParameter = this.getUrlParameter.bind(this);
    this.excludeComponets = this.excludeComponets.bind(this);
    this.publishMessage = this.publishMessage.bind(this);
    this.pageName = this.getCurrentPage();
    this.pgAPI = 'api';
    this.pgEndpoint = 'endpoint';
    this.pgProxy = 'proxy';
    this.pgSequence = 'sequence';
  }


  getCurrentPage() {
    let pageName;
    let href = parent.window.location.href;
    let lastSegment = href.substr(href.lastIndexOf('/') + 1);
    if (lastSegment.indexOf('?') == -1) {
      pageName = lastSegment;
    } else {
      pageName = lastSegment.substr(0, lastSegment.indexOf('?'));
    }
    return pageName;
  }

  componentDidMount() {

    let query;

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
      let selectedComp = this.getUrlParameter('id');
      this.publishMessage(selectedComp);
    }

    super.getWidgetConfiguration(this.props.widgetID)
      .then((message) => {
        if (this.pageName == this.pgAPI || this.pageName == this.pgProxy || this.pageName == this.pgEndpoint) {
          query = message.data.configs.providerConfig.configs.config.queryData.queryESB;
        } else {
          query = message.data.configs.providerConfig.configs.config.queryData.queryMediator;
        }
        message.data.configs.providerConfig.configs.config.queryData.query = query.replace('{{paramComponentType}}', '\'' + this.pageName + '\'');
        super.getWidgetChannelManager().subscribeWidget(this.props.id, this.handleDataReceived, message.data.configs.providerConfig);
      })
      .catch((error) => {
        this.setState({
          faultyProviderConf: true
        });
      });
  }

  handleDataReceived(data) {

    var componentNameArr = data.data.map(
      function (nameArr) {
        return nameArr[0];
      });

    if (this.pageName == this.pgEndpoint) {
      let excludeSequences = ["AnonymousEndpoint"];
      this.excludeComponets(componentNameArr, excludeSequences);
    }

    else if (this.pageName == this.pgSequence) {
      let excludeSequences = ["PROXY_INSEQ", "PROXY_OUTSEQ", "PROXY_FAULTSEQ", "API_OUTSEQ", "API_INSEQ", "API_FAULTSEQ", "AnonymousSequence"];
      this.excludeComponets(componentNameArr, excludeSequences);
    }

    this.setState({
      optionArray: componentNameArr.map(option => ({
        value: option,
        label: option,
      }))
    });
  }


  excludeComponets(componentNameArr, excludeSequences) {
    let item;
    for (item in excludeSequences) {
      let exSeq = excludeSequences[item];
      let index = componentNameArr.indexOf(exSeq);
      if (index > -1) {
        componentNameArr.splice(index, 1);
      }
    }
  }
  getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  };

  handleChange(event) {
    if (event) {
      let selectedValue = event.value;
      this.publishMessage(selectedValue);
    }
  }

  publishMessage(pubMessage) {
    this.setState({ selectedOption: pubMessage });
    let selectedComponent = { "selectedComponent": pubMessage };
    this.publishedMsgSet.push({ time: new Date(), value: pubMessage });
    super.publish(selectedComponent);
    //super.publish(JSON.stringify(selectedComponent));
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
