import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Col from 'react-bootstrap/Col';
import '../generic/General.css';
import './CategoriesPage.css';

import LogoHeader from '../generic/LogoTitleHeader';
import CategoriesTable from './CategoriesTable';
import RenamePopup from './RenamePopup';
import DeletePopup from '../generic/GenericPopup';

class ModelTablePage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentTab: 'model',
            renamePopup: {
                pk: null,
                currentName: '',
                newName: '',
                isShown: false,
                errors: []
            },
            deletePopup: {
                pk: null,
                isShown: false,
                errors: [],
                name: '',
            },

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
        this.onDeleteClick = this.onDeleteClick.bind(this);
        this.onDeleteSubmit = this.onDeleteSubmit.bind(this);
        this.onDeleteCancel = this.onDeleteCancel.bind(this);
        this.onInstrumentTableChange = this.onInstrumentTableChange.bind(this);
        this.onTabChange = this.onTabChange.bind(this);
    }

    async componentDidMount() {
        await this.updateModelCategories();
        await this.updateInstrumentCategories();
    }

    render() {
        let renamePopup = (this.state.renamePopup.isShown) ? this.makeRenamePopup() : null;
        let deletePopup = (this.state.deletePopup.isShown) ? this.makeDeletePopup() : null;
        return (
            <div className="background">
                {renamePopup}
                {deletePopup}
                <div className="row mainContent">

                    <Col className="category-page-content">
                        <LogoHeader
                            title="Category Management"
                        />
                        <Tabs defaultActiveKey={this.state.currentTab} onSelect={this.onTabChange}>
                            <Tab eventKey="model" title="Model Categories">
                                <CategoriesTable
                                    data={this.state.modelCategories.data}
                                    onTableChange={this.onModelTableChange}
                                    pagination={{ page: this.state.modelCategories.pagination.currentPageNum, sizePerPage: (this.state.modelCategories.pagination.showAll ? this.state.modelCategories.pagination.resultCount : this.state.modelCategories.pagination.resultsPerPage), totalSize: this.state.modelCategories.pagination.resultCount }}
                                    onCategoryEdit={this.onEditClicked}
                                    onCategoryDelete={this.onDeleteClick}
                                />
                            </Tab>
                            <Tab eventKey="instrument" title="Instrument Categories">
                                <CategoriesTable
                                    data={this.state.instrumentCategories.data}
                                    onTableChange={this.onInstrumentTableChange}
                                    pagination={{ page: this.state.instrumentCategories.pagination.currentPageNum, sizePerPage: (this.state.instrumentCategories.pagination.showAll ? this.state.instrumentCategories.pagination.resultCount : this.state.instrumentCategories.pagination.resultsPerPage), totalSize: this.state.instrumentCategories.pagination.resultCount }}
                                    onCategoryEdit={this.onEditClicked}
                                    onCategoryDelete={this.onDeleteClick}
                                />
                            </Tab>

                        </Tabs>

                    </Col>
                </div>
            </div>
        )
    }

    makeRenamePopup() {
            return (
                <RenamePopup
                    isShown={this.state.renamePopup.isShown}
                    onClose={this.onEditClose}
                    onSubmit={this.onEditSubmit}
                    errors={this.state.renamePopup.errors}
                    currentName={this.state.renamePopup.currentName}
                />
            )
    }

    makeDeletePopup() {
        let body = (
            <p>Are you sure you want to delete category '{this.state.deletePopup.name}'?</p>
        )
        return(
            <DeletePopup
                show={this.state.deletePopup.isShown}
                body={body}
                headerText="Warning!"
                closeButtonText="Cancel"
                submitButtonText="Delete"
                onClose={this.onDeleteCancel}
                onSubmit={this.onDeleteSubmit}
                submitButtonVariant="danger"
            />
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
        switch (this.state.currentTab) {
            case 'model':
                return;
            case 'instrument':
                return;
            default:
                console.log(`Edit unspoorted for this tab: ${this.state.currentTab}`)
                return;
        }
        this.onEditClose();
    }

    onDeleteClick(e) {
        console.log("clicked")
        this.setState({
            deletePopup: {
                ...this.state.deletePopup,
                isShown: true,
                name: e.target.name,
                pk: e.target.value
            }
        })
        console.log(`Click delete ${e.target.name}`);
    }

    onDeleteSubmit(e) {
        console.log(`Wants to delete ${this.state.deletePopup.name}`);
        this.onDeleteCancel();
    }

    onDeleteCancel() {
        this.setState({
            deletePopup: {
                ...this.state.deletePopup,
                isShown: false,
                name: '',
                pk: null
            }
        })
    }

    onInstrumentTableChange(type, { page, sizePerPage }) {
        console.log(type);
    }



}

export default ModelTablePage;