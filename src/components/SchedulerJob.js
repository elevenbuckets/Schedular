import CastIronStore from "../../../../public/store/CastIronStore";
import CastIronService from "../../../../public/service/CastIronService";
import Reflux from 'reflux';
import React from 'react';
import Dropdown from 'react-dropdown';
import CastIronActions from '../../../../public/action/CastIronActions';
import TxObjects from '../../../../public/view/TxObjects';
import ScheduleTxQList from './ScheduleTxQList';
import { createCanvasWithAddress, setDappLocalState } from "../../../../public/util/Utils";

class SchedulerJob extends Reflux.Component {
    constructor(props) {
        super(props);
        this.store = CastIronStore;
        this.state = {
            dappLocal: {
                recipient: ''
            }
        };
        this.wallet = CastIronService.wallet;
        this.timeout;
    }

    handleEnqueueSchedule(tx) {
        CastIronActions.enqueueSchedule(tx);
    }

    handleDequeueSchedule(tx) {
        CastIronActions.dequeueScheudle(tx);
    }

    handleClearQueueSchedule() {
        CastIronActions.clearQueueschedule();
    }


    handleSchedule = (addr, type, amount, gasNumber) => {
        CastIronActions.schedule(this.state.address, addr, type, amount, gasNumber);
    }

    handleBatchSchedule() {
        CastIronActions.batchSchedule();
    }


    handleChange = (event) => {
        let addr = event.target.value;
        console.log('got addr: ' + addr);
        try {
            if (CastIronService.wallet.web3.isAddress(addr) === true
                && (CastIronService.wallet.web3.toAddress(addr) == addr || CastIronService.wallet.web3.toChecksumAddress(addr) == addr)
            ) {
                addr = CastIronService.wallet.web3.toAddress(addr);
                createCanvasWithAddress(this.refs.canvas, addr);
            } else {
                this.refs.canvas.getContext('2d').clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
            }
        } catch (err) {
            this.refs.canvas.getContext('2d').clearRect(0, 0, this.refs.canvas.width, this.refs.canvas.height);
        }

        setDappLocalState(this, { recipient: addr });
    }

    back = () =>{
        this.props.goTo("List");
        if(this.props.viewType == "Edit"){
            this.props.cleanEdit();
        }
    }

    render = () => {
        return (
            <div>
                <table className="balance-sheet">
                    <tbody>
                        <tr className="avatar" style={{ textAlign: "center" }}>
                            <th colSpan="2" className="avatar" style={{ textAlign: "center" }}>Schedular</th>
                        </tr>
                        <tr className="balance-sheet">
                            <td className="balance-sheet">
                                <label>
                                    Recipient:
       <input size={62} style={{ marginLeft: '30', fontFamily: 'monospace', fontSize: '1.09em' }} type='text'
                                        onChange={this.handleChange} value={this.state.dappLocal.recipient} placeholder="Ethereum Address" />
                                </label>
                            </td>
                            <td className="balance-sheet" width={211} rowSpan='2' style={{ backgroundColor: '#eeeeee' }}>
                                <table className="txform"><tbody><tr className="txform"><td className="txform" style={{ textAlign: 'center' }}>
                                    <canvas ref='canvas' width={66} height={66} style=
                                        {
                                            {
                                                border: "3px solid #ccc",
                                                borderBottomLeftRadius: "2.8em",
                                                borderBottomRightRadius: "2.8em",
                                                borderTopRightRadius: "2.8em",
                                                borderTopLeftRadius: "2.8em"
                                            }
                                        }
                                    /></td></tr></tbody></table>
                            </td>
                        </tr>
                        <tr className="balance-sheet">
                            <td className="balance-sheet">
                                <TxObjects selected_token_name={this.state.selected_token_name}
                                    handleEnqueue={this.handleEnqueueSchedule} handleSend={this.handleSchedule}
                                    recipient={this.state.dappLocal.recipient} send_button_value="Schedule" />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <ScheduleTxQList style={{ marginTop: '0', marginBottom: '0', paddingTop: '0', paddingBottom: '0' }} />
                <div style=
                    {
                        {
                            textAlign: 'center',
                            backgroundColor: '#ffffff',
                            width: '100%',
                            maxHeight: '58',
                            minHeight: '58',
                            zIndex: '1',
                            position: "fixed",
                            bottom: '20%',
                            boxShadow: '0 -5px 6px -5px rgba(200,200,200,0.5)'
                        }
                    }>
                    <input type="button" className="button" value='BatchSchedule' onClick={this.handleBatchSchedule} style={{ width: '160px', marginTop: '19px', marginLeft: '5%', marginRight: '5%' }} />
                    <input type="button" className="button" value='ClearAll' onClick={this.handleClearQueue} style={{ backgroundColor: 'rgb(250,0,0)', width: '160px', marginTop: '19px', marginLeft: '5%', marginRight: '5%' }} />
                    <input type="button" className="button" value='Back' onClick={this.back} style={{  width: '160px', marginTop: '19px', marginLeft: '5%', marginRight: '5%' }} />
                </div>
            </div>
        );
    }
}

export default SchedulerJob
