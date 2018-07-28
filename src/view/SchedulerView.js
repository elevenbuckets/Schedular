import CastIronStore from "../../../../public/store/CastIronStore";
import CastIronService from "../../../../public/service/CastIronService";
import Reflux from 'reflux';
import React from 'react';
import Dropdown from 'react-dropdown';
import CastIronActions from '../../../../public/action/CastIronActions';
import TxObjects from '../../../../public/view/TxObjects';
import TxQList from '../../../../public/view/TxQList';
import { createCanvasWithAddress, setDappLocalState } from "../../../../public/util/Utils";
import SchedulerJob from '../components/SchedulerJob';
import EditScheduleTXModal from '../../../../public/components/EditScheduleTXModal';
import Scheduler from '../../../../public/util/Scheduler'
import dappViewService from "../../../../src/service/DappViewService";

class SchedulerView extends Reflux.Component {
    constructor(props) {
        super(props);
        this.store = CastIronStore;
        this.state = {
            dappLocal: {
                recipient: '',
                schedulerViewType: "List", // Options are List, New, Edit
                selectedQs: [],
                filteredQs: [],
                filter: {},
                showSearch : false
            }

        };
        this.wallet = CastIronService.wallet;
    }

    componentDidMount = () =>{
        setDappLocalState(this, {filteredQs: this.state.scheduledQs});
    }

    componnentDidUpdate = (prevProps, prevState) =>{
        if(prevState.scheduledQs != this.state.scheduledQs){
            let filteredQs = this.state.scheduledQs;
            let filter = this.state.dappLocal.filter;
            // filteredQs = filteredQs.filter(q => {
            //     return JSON.stringify(q) == JSON.stringify({ ...q, ...this.state.dappLocal.filter });
            // })
            filteredQs = filteredQs.filter(q => {
                return Object.keys(filter).reduce((match, key) =>{
                    return match && q[key].includes(filter[key]);
                }, true)
                // return JSON.stringify(q) == JSON.stringify({ ...q, ...filter });
            })
            setDappLocalState(this, {filteredQs : filteredQs })
        }
    }

    saveScheduleTX = (Q) => {
        // Use Schedule now, need to figure out how to change from state
        Scheduler.state.Qs.map(q => {
            if (q.Qid == Q.Qid) {
                Object.keys(q).map(key => {
                    q[key] = Q[key];
                })
            }
        })

        this.goTo("List");
    }

    cancelChangeScheduleTX = () => {
        this.goTo("List");
    }

    goTo = (view) => {
        setDappLocalState(this, { schedulerViewType: view });
    }

    cleanEdit() {
        CastIronActions.clearQueueSchedule();
        setDappLocalState(this, { selectedQs: [] });
    }

    getActiveTaskNumber = () => {
        return this.state.dappLocal.filteredQs.length;
    }


    checked = (Q, event) => {
        if (event.target.checked) {
            setDappLocalState(this, { selectedQs: [...this.state.dappLocal.selectedQs, Q] })
        } else {
            if (this.state.dappLocal.selectedQs.indexOf(Q) != -1) {
                this.state.dappLocal.selectedQs.splice(this.state.dappLocal.selectedQs.indexOf(Q), 1);
                setDappLocalState(this, { selectedQs: this.state.dappLocal.selectedQs })
            }

        }
    }

    delete = () =>{
        // 
        // this.state.dappLocal.selectedQs.map(Q => {
        //     if(Scheduler.state.Qs.indexOf(Q) != -1){
        //         Scheduler.state.Qs.splice(Scheduler.state.Qs.indexOf(Q), 1);
        //         CastIronActions.deleteScheduledQ(Q);
        //     }
           
        // })
	let cloneQs = [ ...this.state.dappLocal.selectedQs ];
        Scheduler.deleteQs(cloneQs);
        CastIronActions.deleteScheduledQs(cloneQs);
        setDappLocalState(this, {selectedQs : []});

    }

    changeFilter = (field, event) =>{
        let filter =  {...this.state.dappLocal.filter, [field] : event.target.value}
        if(event.target.value == ""){
            delete filter[field];
        }
        let filteredQs = this.state.scheduledQs;
        filteredQs = filteredQs.filter(q => {
            return Object.keys(filter).reduce((match, key) =>{
               return match && q[key].includes(filter[key]);
            }, true)
            // return JSON.stringify(q) == JSON.stringify({ ...q, ...filter });
        })
        setDappLocalState(this, {filter: filter, filteredQs : filteredQs })
    }

    toggleSearch = () =>{
        setDappLocalState(this, {showSearch : !this.state.dappLocal.showSearch});
    }

    getQsComponent = () => {
        if (this.state.dappLocal.filteredQs) {
            return this.state.dappLocal.filteredQs.map((q) => {
                return (
                    <tr className="balance-sheet">
                        <td className="balance-sheet"
                            width='5%'><input
                                name="check"
                                type="checkbox"
                                checked = {this.state.dappLocal.selectedQs.includes(q)}
                                onChange={this.checked.bind(this, q)}
                                style={{ width: "25px", height: "25px" }} /></td>
                        <td className="balance-sheet"
                            width='30%'>{q.Qid}</td>
                        <td className="balance-sheet"
                            width='20%'>{q.name}</td>
                        <td className="balance-sheet"
                            width='20%'>{q.trigger}</td>
                        <td className="balance-sheet"
                            width='10%'>{q.target}</td>
                        <td className="balance-sheet"
                            width='5%'>{q.tolerance}</td>
                        <td className="balance-sheet"
                            width='10%'>{q.status}</td>

                    </tr>
                );
            })
        }

    }



    render = () => {
        return this.state.dappLocal.schedulerViewType != "New" ? (<div>
            <table className="balance-sheet">
                <tbody>
                    <tr className="avatar" style={{ textAlign: "center" }}>
                        <th colSpan="2" className="avatar" style={{ textAlign: "center" }}>Schedular</th>
                    </tr>
                    <tr className="balance-sheet">
                        <td className="txform" style={{ border: '0', textAlign: "left" }}>
                            <input type="button" className="bbutton" value='New' onClick={this.goTo.bind(this, "New")} />
                            <input type="button" className="bbutton" value='Edit' onClick={this.goTo.bind(this, "Edit")}
                                disabled={this.state.dappLocal.selectedQs.length != 1} />
                            <input type="button" className="bbutton" value='Search' onClick={this.toggleSearch} />
                            <input type="button" className="bbutton" value='Delete' onClick={this.delete}
                            disabled={this.state.dappLocal.selectedQs.length == 0 }  />
                        </td>
                        <td className="txform" style={{ border: '0', textAlign: "center" }}>
                            <p>Active Tasks: {this.getActiveTaskNumber()}</p>
                        </td>
                    </tr>

                </tbody>
            </table>

            <div style={{ overflow: 'scroll', margin: '0', maxHeight: "490px", height: '490px' }} >
                <table className="balance-sheet">
                    <tbody>
                        <tr className="balance-sheet">
                            <th className="balance-sheet" style={{ color: '#111111' }} width='5%'>Select</th>
                            <th className="balance-sheet" style={{ color: '#111111' }} width='30%'>Qid</th>
                            <th className="balance-sheet" style={{ color: '#111111' }} width='20%'>Name</th>
                            <th className="balance-sheet" style={{ color: '#111111' }} width='20%'>Trigger</th>
                            <th className="balance-sheet" style={{ color: '#111111' }} width='10%'>Target</th>
                            <th className="balance-sheet" style={{ color: '#111111' }} width='5%'>Tolerance</th>
                            <th className="balance-sheet" style={{ color: '#111111' }} width='10%'>Status</th>
                        </tr>
                        <tr className="balance-sheet" style={{ textAlign: "center" }}>
                            <th colSpan="7" className="balance-sheet" style={{ textAlign: "center" }} hidden="true">Color Swap</th>
                        </tr>
                        <tr className="balance-sheet" hidden={!this.state.dappLocal.showSearch}>
                            <td className="balance-sheet"
                                width='5%'></td>
                            <td className="balance-sheet"
                                width='30%'><input type='text' size='36'
                                    onChange={this.changeFilter.bind(this, "Qid")}
                                    /></td>
                            <td className="balance-sheet"
                                width='20%'><input type='text' size='20'
                                    onChange={this.changeFilter.bind(this, "name")}
                                   /></td>
                            <td className="balance-sheet"
                                width='20%'><input type='text' size='20'
                                    onChange={this.changeFilter.bind(this, "trigger")}
                                    /></td>
                            <td className="balance-sheet"
                                width='10%'><input type='text' size='10'
                                    onChange={this.changeFilter.bind(this, "target")}
                                   /></td>
                            <td className="balance-sheet"
                                width='5%'><input type='text' size='5'
                                    onChange={this.changeFilter.bind(this, "tolerance")}
                                     /></td>
                            <td className="balance-sheet"
                                width='10%'><input type='text' size='10'
                                    onChange={this.changeFilter.bind(this, "status")}
                                   /></td>

                        </tr>

                        {this.getQsComponent()}
                    </tbody>
                </table>
                <div style=
                    {
                        {
                            textAlign: 'center',
                            backgroundColor: '#ffffff',
                            width: '99.5%',
                            maxHeight: '58',
                            minHeight: '58',
                            zIndex: '2',
                            position: "fixed",
                            bottom: '20%',
                            boxShadow: '0 -5px 6px -5px rgba(200,200,200,0.5)'
                        }
                    }>
                    <input type='text' style={{ paddingTop: '15px', fontFamily: 'monospace', border: 0, width: '85%', fontSize: '1.11em', textAlign: 'center' }} align='center' ref='infocache' value='' />
                </div>
            </div>
            {this.state.dappLocal.selectedQs.length == 0 ? '' : <EditScheduleTXModal saveScheduleTX={this.saveScheduleTX} cancelChangeScheduleTX={this.cancelChangeScheduleTX}
                Q={this.state.dappLocal.selectedQs[0]}
                isEditScheduleModalOpen={this.state.dappLocal.schedulerViewType == "Edit"} gasPrice={this.state.gasPrice} />}

        </div>) : this.state.dappLocal.schedulerViewType == "New" ? <SchedulerJob viewType={this.state.dappLocal.schedulerViewType}
            goTo={this.goTo} /> :
                <SchedulerJob goTo={this.goTo} cleanEdit={this.cleanEdit} viewType={this.state.dappLocal.schedulerViewType} Q={this.state.dappLocal.selectedQs.length == 0 ?
                    null : this.state.dappLocal.selectedQs[0]} />




    }
}

export default SchedulerView
