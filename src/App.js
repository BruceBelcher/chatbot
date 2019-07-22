import React, { Component } from 'react';

import ChatBot, { Loading } from 'react-simple-chatbot';
import PropTypes from 'prop-types';


class DBPedia extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        loading: true,
        result: '',
        trigger: false,
      };
  
      this.triggetNext = this.triggetNext.bind(this);
    }
  
    componentWillMount() {
      const self = this;
      const { steps } = this.props;
      const search = steps.search.value;
      const endpoint = encodeURI('https://dbpedia.org');
      const query = encodeURI(`
        select * where {
        ?x rdfs:label "${search}"@en .
        ?x rdfs:comment ?comment .
        FILTER (lang(?comment) = 'en')
        } LIMIT 100
      `);
  
      const queryUrl = `https://dbpedia.org/sparql/?default-graph-uri=${endpoint}&query=${query}&format=json`;
  
      const xhr = new XMLHttpRequest();
  
      xhr.addEventListener('readystatechange', readyStateChange);
  
      function readyStateChange() {
        if (this.readyState === 4) {
          const data = JSON.parse(this.responseText);
          const bindings = data.results.bindings;
          if (bindings && bindings.length > 0) {
            self.setState({ loading: false, result: bindings[0].comment.value });
          } else {
            self.setState({ loading: false, result: 'Not found.' });
          }
        }
      }
  
      xhr.open('GET', queryUrl);
      xhr.send();
    }
  
    triggetNext() {
      this.setState({ trigger: true }, () => {
        this.props.triggerNextStep();
      });
    }
  
    render() {
      const { trigger, loading, result } = this.state;
  
      return (
        <div className="dbpedia">
          { loading ? <Loading /> : result }
          {
            !loading &&
            <div
              style={{
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              {
                !trigger &&
                <button
                  onClick={() => this.triggetNext()}
                >
                  Search Again
                </button>
              }
            </div>
          }
        </div>
      );
    }
  }
  
  DBPedia.propTypes = {
    steps: PropTypes.object,
    triggerNextStep: PropTypes.func,
  };
  
  DBPedia.defaultProps = {
    steps: undefined,
    triggerNextStep: undefined,
  };
  
  const ExampleDBPedia = () => (
    <ChatBot
      steps={[
    {
      id: '1',
      message: 'What is your name?',
      trigger: '2',
    },
    {
      id: '2',
      user: true,
      trigger: '3',
    },
    {
      id: '3',
      message: 'Hi {previousValue}, nice to meet you!',
      trigger: '4'
      
    },
        {
          id: '4',
          message: 'Type something to search on Wikipédia. (Ex.: Brazil)',
          trigger: 'search',
        },
        {
          id: 'search',
          user: true,
          trigger: '5',
        },
        {
          id: '5',
          component: <DBPedia />,
          waitAction: true,
          trigger: '4',
        },
      ]}
    />
  );
  
  export default ExampleDBPedia;