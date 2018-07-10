import React, { Component } from 'react';
import Widget from '@wso2-dashboards/widget';
import PropTypes from 'prop-types';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import CancelIcon from '@material-ui/icons/Cancel';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ClearIcon from '@material-ui/icons/Clear';
import Chip from '@material-ui/core/Chip';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from 'react-select';
//import Select from '@material-ui/core/Select';
import JssProvider from 'react-jss/lib/JssProvider';
import { Scrollbars } from "react-custom-scrollbars";
import 'react-select/dist/react-select.css';

const darkTheme = createMuiTheme({
  palette: {
    type: "dark"
  }
});

const lightTheme = createMuiTheme({
  palette: {
    type: "light"
  }
});

const customStyles = {
  input: () => ({
    color: 'white'
  }),
  multiValue: () => ({
    borderRadius: 15,
    display: 'flex',
    flexWrap: 'wrap',
    color: 'black',
    fontSize: '90%',
    overflow: 'hidden',
    paddingLeft: 6,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: 'darkgrey',
    minWidth: '20'
  }),
  singleValue: () => ({
    display: 'flex',
    flexWrap: 'wrap',
    color: 'white',
    fontSize: '95%',
  }),
  control: () => ({
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    minHeight: 30,
    backgroundColor: 'rgb(51, 51, 51)',
    borderColor: 'grey',
    borderStyle: 'solid',
    borderWidth: 0,
    boxShadow: '0 0 0 1px grey',
    cursor: 'default',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    outline: '0 !important',
    position: 'relative',
    transition: 'all 100ms',
    paddingTop: 2
  }),
  option: (styles, { data, isDisabled, isFocused }) => {
    return {
      ...styles,
      height: 30,
      backgroundColor: isDisabled
        ? null
        : isFocused ? 'rgba(255, 255, 255, 0.1)' : null,
    };
  },

  menuList: () => ({
    backgroundColor: 'rgb(51, 51, 51)',
  }),
};


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

  }

  componentDidMount() {
    super.getWidgetConfiguration(this.props.widgetID)
      .then((message) => {
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
    console.log(JSON.stringify(this.state.optionArray));

  }


  handleChange(e) {
    if (e) {
      let selectedValue = e;
      this.setState({ selectedOption: selectedValue });
      console.log(`selectedOption:` + this.state.selectedOption);
      this.publishedMsgSet.push({ time: new Date(), value: selectedValue });
      super.publish(selectedValue);
    }
  }


  render() {

    return (
      <div>
        <Select
          simpleValue
          styles={this.props.muiTheme.name === 'dark' ? customStyles : {}}
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
