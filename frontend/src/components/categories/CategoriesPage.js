import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import '../generic/General.css';
import './CategoriesPage.css';

import LogoHeader from '../generic/LogoTitleHeader';
import CategoriesTable from './CategoriesTable';
import RenamePopup from './RenamePopup';
import DeletePopup from '../generic/GenericPopup';
import CategoryServices from '../../api/categoryServices';

const categoryServices = new CategoryServices();

class CategoriesPage extends Component {
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
            createPopup: {
                isShown: false,
                errors: [],
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
                    resultCount: 2,
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
                    resultCount: 2,
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
        this.onCreateClicked = this.onCreateClicked.bind(this);
        this.onCreateSubmit = this.onCreateSubmit.bind(this);
        this.onCreateCancel = this.onCreateCancel.bind(this);
        this.onInstrumentTableChange = this.onInstrumentTableChange.bind(this);
        this.onTabChange = this.onTabChange.bind(this);
    }

    async componentDidMount() {
        await this.updateModelCategories();
        await this.updateInstrumentCategories();
    }

    render() {
        let createPopup = (this.state.createPopup.isShown) ? this.makeCreatePopup() : null;
        let renamePopup = (this.state.renamePopup.isShown) ? this.makeRenamePopup() : null;
        let deletePopup = (this.state.deletePopup.isShown) ? this.makeDeletePopup() : null;

        let buttonRow = (<div className="table-button-row">
            <Button onClick={this.onCreateClicked}>Create</Button>
        </div>)
        return (
            <div className="background">
                {createPopup}
                {renamePopup}
                {deletePopup}
                <div className="row mainContent">

                    <Col className="category-page-content">
                        <LogoHeader
                            title="Category Management"
                        />
                        <Tabs defaultActiveKey={this.state.currentTab} onSelect={this.onTabChange}>
                            <Tab eventKey="model" title="Model Categories">
                                <div className="categories-table">
                                    <CategoriesTable
                                        data={this.state.modelCategories.data}
                                        onTableChange={this.onModelTableChange}
                                        pagination={{ page: this.state.modelCategories.pagination.currentPageNum, sizePerPage: (this.state.modelCategories.pagination.showAll ? this.state.modelCategories.pagination.resultCount : this.state.modelCategories.pagination.resultsPerPage), totalSize: this.state.modelCategories.pagination.resultCount }}
                                        onCategoryEdit={this.onEditClicked}
                                        onCategoryDelete={this.onDeleteClick}
                                        inlineElements={buttonRow}
                                    />
                                </div>

                            </Tab>
                            <Tab eventKey="instrument" title="Instrument Categories">
                                <div className="categories-table">
                                <CategoriesTable
                                    data={this.state.instrumentCategories.data}
                                    onTableChange={this.onInstrumentTableChange}
                                    pagination={{ page: this.state.instrumentCategories.pagination.currentPageNum, sizePerPage: (this.state.instrumentCategories.pagination.showAll ? this.state.instrumentCategories.pagination.resultCount : this.state.instrumentCategories.pagination.resultsPerPage), totalSize: this.state.instrumentCategories.pagination.resultCount }}
                                    onCategoryEdit={this.onEditClicked}
                                    onCategoryDelete={this.onDeleteClick}
                                    inlineElements={buttonRow}
                                />
                                </div>
                            </Tab>

                        </Tabs>

                    </Col>
                </div>
            </div>
        )
    }

    makeCreatePopup() {
        return (
            <RenamePopup
                title='Create Category'
                isShown={this.state.createPopup.isShown}
                onClose={this.onCreateCancel}
                onSubmit={this.onCreateSubmit}
                errors={this.state.createPopup.errors}
                currentName=''
                submitText='Create'
            />
        )
    }

    makeRenamePopup() {
            return (
                <RenamePopup
                    title='Rename Category'
                    isShown={this.state.renamePopup.isShown}
                    onClose={this.onEditClose}
                    onSubmit={this.onEditSubmit}
                    errors={this.state.renamePopup.errors}
                    currentName={this.state.renamePopup.currentName}
                    submitText='Rename'
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

    // will only update the category of the current tab
    async updateTabCategory() {
        switch (this.state.currentTab) {
            case ('instrument'):
                await this.updateInstrumentCategories();
                return;
            case 'model':
                await this.updateModelCategories();
                return;
            default:
                return;
        }
    }

    async updateModelCategories() {
        await categoryServices.getCategories('model', this.state.modelCategories.pagination.showAll).then(
            (result) => {
                if (result.success) {
                    this.setState({
                        modelCategories: {
                            ...this.state.modelCategories,
                            data: result.data.data,
                            pagination: {
                                ...this.state.modelCategories.pagination,
                                resultCount: result.data.count,
                                numPages: result.data.numpages,
                                currentPageNum: result.data.currentpage
                            }
                        }
                    })
                }
            }
        )
    }

    async updateInstrumentCategories() {
        await categoryServices.getCategories('instrument', this.state.instrumentCategories.pagination.showAll).then(
            (result) => {
                if (result.success) {
                    this.setState({
                        instrumentCategories: {
                            ...this.state.instrumentCategories,
                            data: result.data.data,
                            pagination: {
                                ...this.state.instrumentCategories.pagination,
                                resultCount: result.data.count,
                                numPages: result.data.numpages,
                                currentPageNum: result.data.currentpage
                            }
                        }
                    })
                }
            }
        )
    }

    onTabChange(e) {
        this.setState({
            currentTab: e
        })
    }

    onModelTableChange(type, { page, sizePerPage }) {
        console.log(type);
    }


    onCreateClicked() {
        this.setState({
            createPopup: {
                ...this.state.createPopup,
                isShown: true
            }
        })
    }

    async onCreateSubmit(categoryName) {
        categoryServices.addCategory(this.state.currentTab, categoryName).then(
            (result) => {
                if (result.success) {
                    this.onCreateCancel();
                    this.updateTabCategory();

                }
            }
        )
    }

    onCreateCancel() {
        this.setState({
            createPopup: {
                ...this.state.createPopup,
                isShown: false,
                errors: []
            }
        })
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
        categoryServices.editCategory(this.state.currentTab, newName, this.state.renamePopup.pk).then(
            (result) => {
                if (result.success) {
                    this.onEditClose();
                    this.updateTabCategory();
                }
            }
        )
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

export default CategoriesPage;