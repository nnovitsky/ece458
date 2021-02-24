import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import '../generic/General.css';
import logo from '../../assets/HPT_logo_crop.png';
import CategoriesTable from './ModelCategoriesTable';

class ModelTablePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modelCategories: {
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
            }

        }

        this.onModelTableChange = this.onModelTableChange.bind(this);
        this.onEditModelClicked = this.onEditModelClicked.bind(this);
        this.onInstrumentTableChange = this.onInstrumentTableChange.bind(this);
        this.onEditInstrumentClicked = this.onEditInstrumentClicked.bind(this);
    }

    async componentDidMount() {
        await this.updateModelCategories();
        await this.updateInstrumentCategories();
    }

    render() {
        return (
            <div className="background">
                <div className="row mainContent">
                    <div className="col-2 text-center button-col">
                        <img src={logo} alt="Logo" />
                    </div>
                    <div className="col-10">
                        <Tabs defaultActiveKey="modelCategory">
                            <Tab eventKey="modelCategory" title="Model Categories">
                                <CategoriesTable
                                    data={this.state.modelCategories.data}
                                    onTableChange={this.onModelTableChange}
                                    pagination={{ page: this.state.modelCategories.pagination.currentPageNum, sizePerPage: (this.state.modelCategories.pagination.showAll ? this.state.modelCategories.pagination.resultCount : this.state.modelCategories.pagination.resultsPerPage), totalSize: this.state.modelCategories.pagination.resultCount }}
                                    onCategoryEdit={this.onEditModelClicked}
                                />
                            </Tab>
                            <Tab eventKey="instrumentCategory" title="Instrument Categories">
                                <CategoriesTable
                                    data={this.state.instrumentCategories.data}
                                    onTableChange={this.onInstrumentTableChange}
                                    pagination={{ page: this.state.instrumentCategories.pagination.currentPageNum, sizePerPage: (this.state.instrumentCategories.pagination.showAll ? this.state.instrumentCategories.pagination.resultCount : this.state.instrumentCategories.pagination.resultsPerPage), totalSize: this.state.instrumentCategories.pagination.resultCount }}
                                    onCategoryEdit={this.onEditInstrumentClicked}
                                />
                            </Tab>

                        </Tabs>

                    </div>
                </div>
            </div>
        )
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

    onModelTableChange(type, { page, sizePerPage }) {
        console.log(type);
    }

    onEditModelClicked(e) {
        console.log(`Rename requested for ${e.target.name} with pk ${e.target.value}`);
    }

    onInstrumentTableChange(type, { page, sizePerPage }) {
        console.log(type);
    }

    onEditInstrumentClicked(e) {
        console.log(`Rename requested for ${e.target.name} with pk ${e.target.value}`);
    }



}

export default ModelTablePage;