import React from "react";
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count: 5,
    };
    this.handleDecrement = this.handleDecrement.bind(this);
    this.handleIncrement = this.handleIncrement.bind(this);
  }

  handleDecrement() {
    this.setState((curState) => {
      return { count: curState.count - 1 };
    });
  }

  handleIncrement() {
    this.setState((curState) => {
      return { count: curState.count + 1 };
    });
  }

  render() {
    const date = new Date("june 12 2027");
    date.setDate(date.getDate() + this.state.count);

    return (
      <div>
        <h1>Hello, world!</h1>
        <button onClick={this.handleDecrement}>-</button>
        <span>
          {date.toDateString()} {this.state.count}
        </span>
        <button onClick={this.handleIncrement}>+</button>
      </div>
    );
  }
}

export default App;
