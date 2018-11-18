
import React, {
  Component
} from 'react';
import logo from './logo.svg';
import './App.css';
import JSONTree from 'react-json-tree'
import domtoimage from 'dom-to-image';
import ShadowDOM from 'react-shadow';
import ImageDiff from './ImageDiff';


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
const modes = ['difference', 'fade', 'swipe']

class App extends Component {

  state = {
    altered: '',
    original: '',
    fade: 0,
    mode: modes[0],
  }

  constructor(props) {
    super(props);
    this.current = React.createRef();
    this.old = React.createRef();
  }



  componentDidUpdate(prevProps) {
    if (this.props.renderHTML !== prevProps.renderHTML || this.props.renderHTMLOld !== prevProps.renderHTMLOld) {
    setTimeout(() => {
 
      domtoimage.toPng(this.current.current)
        .then((dataUrl) => {

          this.setState({
            original: dataUrl,
            update: Math.random()
          })
        })
        .catch((error) => {
          console.error('oops, something went wrong!', error);
        });
      domtoimage.toPng(this.old.current)
        .then((dataUrl) => {
          this.setState({
            altered: dataUrl
          })
        })
        .catch((error) => {
          console.error('oops, something went wrong!', error);
        });
    }, 100);
  }
  
  }

  render() {
    return ( <div>
      <style>
        {`img {
    max-width: initial;
    max-height: initial;
}`}
      </style>
        <ShadowDOM>
          <div     style={{
            width: 'fit-content'
          }}>
          <div ref={this.current}  
      
          dangerouslySetInnerHTML = {
            {
              __html: this.props.renderHTML
            }
          }
          />
          </div>
        </ShadowDOM> 
        <ShadowDOM >
          <div           style={{
            width: 'fit-content',
            opacity: 0,
          }}>
          <div 
          ref={this.old} 
          dangerouslySetInnerHTML = {
            {
              __html: this.props.renderHTMLOld
            }
          }
          /> 
          </div>
        </ShadowDOM> 
        <JSONTree 
        theme = {
          theme
        }
        data = {
          this.props.docUnderstanding
        }
        invertTheme = {
          false
        }
        />

         <ImageDiff  key={this.state.update} before={this.state.original} after={this.state.altered} type={this.state.mode} value={this.state.fade/10} />
         <input type="range" id="start" name="volume" value={this.state.fade}
         onChange={({ target }) =>this.setState({ fade: target.value })}
         min="0" max="11" />
        {
          modes.map((mode) => <button onClick={() => this.setState({ mode })}>{mode}</button>)
        }
      </div>
    );

  }
}

export default App;