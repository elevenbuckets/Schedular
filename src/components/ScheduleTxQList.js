import CastIronStore from "../../../../public/store/CastIronStore";
import Reflux from 'reflux';
import React from 'react';
import CastIronActions from "../../../../public/action/CastIronActions";

// Reflux components

class ScheduleTxQList extends Reflux.Component {
  constructor(props) {
    super(props);
    this.store = CastIronStore;
  }


  handleDequeueSchedule(tx, event) {
    CastIronActions.dequeueSchedule(tx);
  }

  handScheduleTxInQueue(tx, event) {
    CastIronActions.scheduleTxInQueue(tx);
    event.target.blur();
  }

  render = () => {
    if (this.state.address == '') return (<p />);

    let tokenBalances = [];
    let tokenkinds = 0;
    this.state.tokenList.map((t) => {
      tokenBalances.push(t + ': ' + this.state.balances[t]);
      if (this.state.balances[t] > 0) tokenkinds++;
    });

    return (
      <div style={{ overflow: 'scroll', margin: '0', maxHeight: "430", height: '430px' }} >
        <table className="txform">
          <tbody>
            <tr>
              <td className="txform" width='3%'>X</td>
              <td className="txform" width='32%'>From</td>
              <td className="txform" width='32%'>To</td>
              <td className="txform" width='4%'>Type</td>
              <td className="txform" width='10%'>Amount</td>
              <td className="txform" width='10%'>Gas Fee</td>
              <td className="txform">Actions</td>
            </tr>
            {this.state.scheduleQueuedTxs.map((tx) => {
              return (
                <tr>
                  <td className="txform" width='5%'><input type="button" className="xbutton" value='X'
                    onClick={this.handleDequeueSchedule.bind(this, tx)} /></td>
                  <td className="txform" width='32%'>{tx.from}</td>
                  <td className="txform" width='32%'>{tx.to}</td>
                  <td className="txform" width='4%' >{tx.type}</td>
                  <td className="txform" width='10%'>{tx.amount}</td>
                  <td className="txform" width='10%'>{tx.gas * this.state.gasPrice}</td>
                  <td className="txform"><input type="button" className="button" value='Schedule'
                    onClick={this.handScheduleTxInQueue.bind(this, tx)} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default ScheduleTxQList
