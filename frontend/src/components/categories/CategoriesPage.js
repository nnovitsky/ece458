import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import CategoriesTable from './ModelCategoriesTable';
import RenamePopup from './RenamePopup';

class ModelTablePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            renamePopup: {
                pk: null,
                currentName: '',
                newName: '',
                isShown: false,
                errors: []
            },
            currentTab: 'model',
            modelCategories: {
                data: [],
                pagination: {
                    resultCount: 0,
                    numPages: 1,
                    resultsPerPage: 10,
                    currentPageNum: 1,
                    desiredPage: 1,
                    showAll: false,
                },
            },
            instrumentCategories: {
                data: [],
                pagination: {
                    resultCount: 0,
                    numPages: 1,
                    resultsPerPage: 10,
                    currentPageNum: 1,
                    desiredPage: 1,
                    showAll: false,
                }
            },
            
        }

        this.onModelTableChange = this.onModelTableChange.bind(this);
        this.onEditClicked = this.onEditClicked.bind(this);
        this.onEditClose = this.onEditClose.bind(this);
        this.onEditSubmit = this.onEditSubmit.bind(this);
        this.onInstrumentTableChange = this.onInstrumentTableChange.bind(this);
        this.onTabChange = this.onTabChange.bind(this);
    }

    async componentDidMount() {
        await this.updateModelCategories();
        await this.updateInstrumentCategories();
    }

    render() {
        let renamePopup = this.makeRenamePopup();    //will return null if not being displayed
        return (
            <div className="background">
                {renamePopup}
                <div className="row mainContent">
                    <div className="col-2 text-center button-col">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="col-10">
                        <Tabs defaultActiveKey={this.state.currentTab} onSelect={this.onTabChange}>
                            <Tab eventKey="model" title="Model Categories">
                                <CategoriesTable
                                    data={this.state.modelCategories.data}
                                    onTableChange={this.onModelTableChange}
                                    pagination={{ page: this.state.modelCategories.pagination.currentPageNum, sizePerPage: (this.state.modelCategories.pagination.showAll ? this.state.modelCategories.pagination.resultCount : this.state.modelCategories.pagination.resultsPerPage), totalSize: this.state.modelCategories.pagination.resultCount }}
                                    onCategoryEdit={this.onEditClicked}
                                />
                            </Tab>
                            <Tab eventKey="instrument" title="Instrument Categories">
                                <CategoriesTable
                                    data={this.state.instrumentCategories.data}
                                    onTableChange={this.onInstrumentTableChange}
                                    pagination={{ page: this.state.instrumentCategories.pagination.currentPageNum, sizePerPage: (this.state.instrumentCategories.pagination.showAll ? this.state.instrumentCategories.pagination.resultCount : this.state.instrumentCategories.pagination.resultsPerPage), totalSize: this.state.instrumentCategories.pagination.resultCount }}
                                    onCategoryEdit={this.onEditClicked}
                                />
                            </Tab>

                        </Tabs>

                    </div>
                </div>
            </div>
        )
    }

    makeRenamePopup() {
        if (this.state.renamePopup.isShown) {
            return (
                <RenamePopup
                    isShown={this.state.renamePopup.isShown}
                    onClose={this.onEditClose}
                    onSubmit={this.onEditSubmit}
                    errors={this.state.renamePopup.errors}
                    currentName={this.state.renamePopup.currentName}
                />
            )
        } else {
            return null;
        }
    }

    async updateModelCategories() {
        this.setState({
            modelCategories: {
                ...this.state.modelCategories,
                data: [
                    {
                        category: "red",
                        pk: 1,
                        count: 23
                    },
                    {
                        category: "green",
                        pk: 2,
                        count: 10
                    }
                ]
            }
        })
    }

    async updateInstrumentCategories() {
        this.setState({
            instrumentCategories: {
                ...this.state.instrumentCategories,
                data: [
                    {
                        category: "van1",
                        pk: 1,
                        count: 7
                    },
                    {
                        category: "van2",
                        pk: 2,
                        count: 6
                    }
                ]
            }
        })
    }

    onTabChange(e) {
        this.setState({
            currentTab: e
        })
    }

    onModelTableChange(type, { page, sizePerPage }) {
        console.log(type);
    }

    onEditClicked(e) {
        console.log(`Rename requested for ${e.target.name} with pk ${e.target.value}`);
        this.setState({
            renamePopup: {
                ...this.state.renamePopup,
                pk: e.target.value,
                currentName: e.target.name,
                isShown: true,
            }
        })
    }

    onEditClose() {
        this.setState({
            renamePopup: {
                ...this.state.renamePopup,
                pk: null,
                currentName: '',
                isShown: false,
            }
        })
    }

    onEditSubmit(newName) {
        console.log(`New name: ${newName}`);
        this.onEditClose();
    }

    onInstrumentTableChange(type, { page, sizePerPage }) {
        console.log(type);
    }



}

export default ModelTablePage;