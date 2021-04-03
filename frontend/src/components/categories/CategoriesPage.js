import React, { Component } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import '../generic/General.css';
import './CategoriesPage.css';
import ErrorFile from "../../api/ErrorMapping/CategoryErrors.json";
import { withRouter } from "react-router-dom";
import { rawErrorsToDisplayed, hasModelEditAccess, hasInstrumentEditAccess } from '../generic/Util';

import LogoHeader from '../generic/LogoTitleHeader';
import CategoriesTable from './CategoriesTable';
import RenamePopup from './RenamePopup';
import DeletePopup from '../generic/GenericPopup';
import CategoryServices from '../../api/categoryServices';
import GenericLoader from '../generic/GenericLoader';

const categoryServices = new CategoryServices();

class CategoriesPage extends Component {
    constructor(props) {
        super(props);
        console.log(props.location);
        const arr = props.location.pathname.split('/');
        this.state = {
            currentTab: arr[arr.length - 1],
            isLoading: false,
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
                force_delete: false,
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
        const createPopup = (this.state.createPopup.isShown) ? this.makeCreatePopup() : null;
        const renamePopup = (this.state.renamePopup.isShown) ? this.makeRenamePopup() : null;
        const deletePopup = (this.state.deletePopup.isShown) ? this.makeDeletePopup() : null;
        const buttonRow = (<div className="table-button-row">
            <Button onClick={this.onCreateClicked}>Create</Button>
            </div>);
    
        const isModelAdmin = hasModelEditAccess(this.props.permissions);
        const content = isModelAdmin ? this.makeTabs(buttonRow) : this.makeInstrumentContent(buttonRow);
        const title = `${this.toUpperCase(this.state.currentTab)} Category Management`;
        return (
            <div className="background">
                {createPopup}
                {renamePopup}
                {deletePopup}
                <GenericLoader
                    isShown={this.state.isLoading}
                />
                <div className="row mainContent">
                    <LogoHeader
                        title={title}
                        headerButtons={null}
                    />
                    <Col className="category-page-content">
                        {content}
                    </Col>
                </div>
            </div>
        )
    }

    toUpperCase(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    makeTabs(buttonRow) {
        return (
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
                            noResultsText="No Model Categories"
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
                            noResultsText="No Instrument Categories"
                        />
                    </div>
                </Tab>

            </Tabs>
        )
    }

    makeInstrumentContent(buttonRow) {
        return(
            <CategoriesTable
                data={this.state.instrumentCategories.data}
                onTableChange={this.onInstrumentTableChange}
                pagination={{ page: this.state.instrumentCategories.pagination.currentPageNum, sizePerPage: (this.state.instrumentCategories.pagination.showAll ? this.state.instrumentCategories.pagination.resultCount : this.state.instrumentCategories.pagination.resultsPerPage), totalSize: this.state.instrumentCategories.pagination.resultCount }}
                onCategoryEdit={this.onEditClicked}
                onCategoryDelete={this.onDeleteClick}
                inlineElements={buttonRow}
                noResultsText="No Instrument Categories"
            />
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
            <p>This category is being used, are you sure you want to delete '{this.state.deletePopup.name}'?</p>
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
                isPrimaryOnLeft={true}
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
        this.setState({
            isLoading: true
        })
        let pagination = this.state.modelCategories.pagination;
        await categoryServices.getCategories('model', pagination.showAll, pagination.desiredPage).then(
            (result) => {
                if (result.success) {
                    let showAll = this.state.modelCategories.pagination.showAll;
                    this.setState({
                        isLoading: false,
                        modelCategories: {
                            ...this.state.modelCategories,
                            data: result.data.data,
                            pagination: {
                                ...this.state.modelCategories.pagination,
                                resultCount: result.data.count,
                                numPages: result.data.numpages,
                                currentPageNum: showAll ? 1 : result.data.currentpage
                            }
                        }
                    })
                }
            }
        )
    }

    async updateInstrumentCategories() {
        this.setState({
            isLoading: true
        })
        let pagination = this.state.instrumentCategories.pagination;
        await categoryServices.getCategories('instrument', pagination.showAll, pagination.desiredPage).then(
            (result) => {
                if (result.success) {
                    let showAll = this.state.instrumentCategories.pagination.showAll;
                    this.setState({
                        isLoading: false,
                        instrumentCategories: {
                            ...this.state.instrumentCategories,
                            data: result.data.data,
                            pagination: {
                                ...this.state.instrumentCategories.pagination,
                                resultCount: result.data.count,
                                numPages: result.data.numpages,
                                currentPageNum: showAll ? 1 : result.data.currentpage
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
        }, () => {
            this.updateTabCategory();
        })
    }

    onModelTableChange(type, { page, sizePerPage }) {
        switch (type) {
            case 'pagination':
                let showAll = (sizePerPage === this.state.modelCategories.pagination.resultCount);
                this.setState({
                    modelCategories: {
                        ...this.state.modelCategories,
                        pagination: {
                            ...this.state.modelCategories.pagination,
                            desiredPage: (showAll ? 1 : page),
                            showAll: showAll
                        }
                    }
                }, () => this.updateModelCategories());
                return;
            default:
                console.log(`Model category table ${type} not supported`);
        }
    }

    onInstrumentTableChange(type, { page, sizePerPage }) {
        switch (type) {
            case 'pagination':
                let showAll = (sizePerPage === this.state.instrumentCategories.pagination.resultCount);
                this.setState({
                    instrumentCategories: {
                        ...this.state.instrumentCategories,
                        pagination: {
                            ...this.state.instrumentCategories.pagination,
                            desiredPage: (showAll ? 1 : page),
                            showAll: showAll
                        }
                    }
                }, () => this.updateInstrumentCategories());
                return;
            default:
                console.log(`Instrument category table ${type} not supported`);
        }
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
        this.setState({
            isLoading: true
        })
        categoryServices.addCategory(this.state.currentTab, categoryName).then(
            (result) => {
                if (result.success) {
                    this.onCreateCancel();
                    this.updateTabCategory();
                } else {
                    let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["add_edit_categories"]);
                    this.setState({
                        createPopup: {
                            ...this.state.createPopup,
                            errors: formattedErrors
                        }
                    })
                }
                this.setState({
                    isLoading: false
                })
            }
        )
    }

    onCreateCancel() {
        this.setState({
            createPopup: {
                ...this.state.createPopup,
                isShown: false,
                errors: [],
            }
        })
    }

    onEditClicked(e) {
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
                errors: [],
            }
        })
    }

    async onEditSubmit(newName) {
        this.setState({
            isLoading: true
        })
        categoryServices.editCategory(this.state.currentTab, newName, this.state.renamePopup.pk).then(
            (result) => {
                if (result.success) {
                    this.updateTabCategory();
                    this.onEditClose();

                } else {
                    let formattedErrors = rawErrorsToDisplayed(result.errors, ErrorFile["add_edit_categories"]);
                    this.setState({
                        renamePopup: {
                            ...this.state.renamePopup,
                            errors: formattedErrors
                        }
                    })
                }
                this.setState({
                    isLoading: false
                })
            }
        )
    }

    onDeleteClick(e) {
        categoryServices.deleteCategory(this.state.currentTab, e.target.value, false).then(
            (result) => {
                if (result.success) {
                    this.updateTabCategory();
                    this.onDeleteCancel();
                } else {
                    if (result.errors.delete_error !== undefined) {
                        this.setState({
                            deletePopup: {
                                ...this.state.deletePopup,
                                isShown: true,
                                name: e.target.name,
                                pk: e.target.value
                            }
                        })
                    }
                }
            }
        )

    }

    onDeleteSubmit() {
        categoryServices.deleteCategory(this.state.currentTab, this.state.deletePopup.pk, true).then(
            (result) => {
                if (result.success) {
                    this.updateTabCategory();
                    this.onDeleteCancel();
                } else {
                    console.log.apply('delete error')
                }
            }
        )
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

}

export default withRouter(CategoriesPage);