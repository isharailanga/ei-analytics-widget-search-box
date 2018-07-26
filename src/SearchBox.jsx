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
    // this.pgAPI = "api";
    // this.pgEndpoint = "endpoint";
    // this.pgProxy = "proxy service";
    // this.pgSequence = "sequence";
    // this.pgInbound= "inbound endpoint";
    this.pgAPI = 'API';
    this.pgEndpoint = 'Endpoint';
    this.pgProxy = 'Proxy Service';
    this.pgSequence = 'Sequence';
    this.pgInbound= 'Inbound Endpoint';
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

    // if a component is already selected, preserve the selection
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('id')) {
      let selectedComp = this.getUrlParameter('id');
      this.publishMessage(selectedComp);
    }

    super.getWidgetConfiguration(this.props.widgetID)
      .then((message) => {
        //based on the component type, query ESB or Mediator stat tables
        if (this.pageName == this.pgAPI.toLowerCase() || this.pageName == this.pgProxy.toLowerCase() || this.pageName == this.pgInbound.toLowerCase()) {
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

    // remove endpoints in the excludeEndpoints-array from the options
    if (this.pageName == this.pgEndpoint.toLowerCase()) {
      let excludeEndpoints = ["AnonymousEndpoint"];
      this.excludeComponets(componentNameArr, excludeEndpoints);
    }

     // remove sequences in the excludeSequences-array from the options
    else if (this.pageName == this.pgSequence.toLowerCase()) {
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

  //remove an array of elements from an array
  excludeComponets(componentNameArr, excludeItems) {
    let item;
    for (item in excludeItems) {
      let exSeq = excludeItems[item];
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

  //publish the given message as an object
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
