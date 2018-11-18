
import React, {
    Component
  } from 'react';
import App from './App'

class Parent extends Component {
  
    state = {
        renderHTML: '',
        docUnderstanding: {},
        renderHTMLOld: '',
    }

  
    componentDidMount() {
        window.addEventListener('message', event => {
            this.setState(event.data)
        })
    }
  
    render() {
        return <App {...this.state} />
    }
  
    
  }
  
  export default Parent;
