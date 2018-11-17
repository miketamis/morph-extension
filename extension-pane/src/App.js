import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import JSONTree from 'react-json-tree'


const theme = {
  base00: '#1E1E1E',
  base01: '#282c34',
  base02: '#808080',
  base03: '#D4D4D4',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#F44747',
  base09: '#007ACC',
  base0A: '#F44747',
  base0B: '#D7BA7D',
  base0C: '#9CDCFE',
  base0D: '#9CDCFE',
  base0E: '#C586C0',
  base0F: '#646695'
}

/*
@very-light-gray:   #D4D4D4;
@light-gray:        #808080;
@gray:              @light-gray;
@dark-gray:         #282c34;
@very-dark-gray:    #1E1E1E;

@light-red:     #D16969;
@dark-red:      #F44747;
@orange:        #CE9178;
@light-yellow:  #DCDCAA;
@dark-yellow:   #D7BA7D;
@puke:          #B5CEA8;
@comment-green: #608B4E;
@seafoam-green: #4EC9B0;
@light-blue:    #9CDCFE;
@dark-blue:     #569CD6;
@bright-blue:   #007ACC;
@purple:        #646695;
@pink:          #C586C0;
*/
class App extends Component {
  render() {
    return (
      <div>

     <div dangerouslySetInnerHTML={{
       __html: window.renderHTML
     }} />
     <JSONTree theme={theme} data={window.docUnderstanding} invertTheme={false}  />

     </div>
    );

  }
}

export default App;
