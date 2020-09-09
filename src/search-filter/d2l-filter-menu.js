/*
`d2l-filter-menu`
Polymer-based web component for the filter menu.
*/

import '@polymer/iron-pages/iron-pages.js';

import '@brightspace-ui/core/components/colors/colors.js';
import 'd2l-typography/d2l-typography-shared-styles.js';
import './d2l-filter-menu-tab.js';
import './d2l-filter-menu-tab-roles.js';

import { createActionUrl, parseEntity } from '../d2l-utility-helpers.js';
import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { Actions } from 'd2l-hypermedia-constants';
import { MyCoursesLocalizeBehavior } from '../localize-behavior.js';

class FilterMenu extends MyCoursesLocalizeBehavior(PolymerElement) {

	static get is() { return 'd2l-filter-menu'; }

	static get properties() {
		return {
			filterStandardDepartmentName: String,
			filterStandardSemesterName: String,
			filterRolesName: String,
			myEnrollmentsEntity: {
				type: Object,
				observer: '_myEnrollmentsEntityChanged'
			},
			tabSearchType: {
				type: String,
				observer: '_tabSearchTypeChanged'
			},
			_departmentFilters: {
				type: Array,
				value: function() { return []; }
			},
			_semesterFilters: {
				type: Array,
				value: function() { return []; }
			},
			_roleFiltersCount: {
				type: Number,
				value: 0
			},
			_searchDepartmentsAction: Object,
			_searchSemestersAction: Object,
			_searchMyEnrollmentsAction: Object,
			_semestersTabSelected: {
				type: Boolean,
				value: false
			},
			_departmentsTabSelected: {
				type: Boolean,
				value: false
			},
			_rolesTabSelected: {
				type: Boolean,
				value: false
			},
			_hasFilters: {
				type: Boolean,
				value: false,
				computed: '_computeHasFilters(_departmentFilters.length, _semesterFilters.length, _roleFiltersCount)'
			},
			_rolesTabHidden: {
				type: Boolean,
				value: false
			},
			_semestersTabHidden: {
				type: Boolean,
				value: false
			},
			_departmentsTabHidden: {
				type: Boolean,
				value: false
			}
		};
	}

	static get template() {
		return html`
		<style>
			:host {
				display: flex;
				flex-direction: column;
			}
			button:hover,
			button:focus {
				text-decoration: underline;
				color: var(--d2l-color-celestine);
			}
			.dropdown-content-header {
				box-sizing: border-box;
				display: flex;
				justify-content: space-between;
				border-bottom: 1px solid var(--d2l-color-mica);
				width: 100%;
				padding: 20px;
			}
			.clear-button {
				@apply --d2l-body-small-text;
				color: var(--d2l-color-celestine);
				background: none;
				border: none;
				cursor: pointer;
				margin: 0 !important;
				padding: 0;
			}
			.dropdown-content-tabs {
				display: flex;
				align-items: center;
			}
			.dropdown-content-tab {
				flex: 1;
			}
			.dropdown-content-tab-button {
				@apply --d2l-body-small-text;
				color: var(--d2l-color-ferrite);
				background: none;
				border: none;
				padding: 10px;
				cursor: pointer;
				display: inherit;
				font-family: inherit;
			}
			.dropdown-content-tab-highlight {
				background-color: var(--d2l-color-celestine);
				border-bottom-left-radius: 4px;
				border-bottom-right-radius: 4px;
				height: 4px;
				width: 80%;
				margin: auto;
			}
			#contentView {
				background: linear-gradient(to top, white, var(--d2l-color-regolith));
			}
		</style>

		<div class="dropdown-content-header">
			<span>[[localize('filtering.filterBy')]]</span>
			<button hidden$="[[!_hasFilters]]" class="clear-button" on-tap="clearFilters">[[localize('filtering.clear')]]</button>
		</div>

		<div id="contentView">
			<div class="dropdown-content-tabs" role="tablist">
				<div class="dropdown-content-tab" role="tab" aria-controls="semestersTab" hidden$="[[_semestersTabHidden]]">
					<div class="dropdown-content-tab-highlight" hidden$="[[!_semestersTabSelected]]"></div>
					<button id="semestersTabButton" class="dropdown-content-tab-button" on-tap="_selectTab" data-tab-name="semesters" aria-pressed="true">
						[[localize('filtering.filterLabel', 'filterLabel', filterStandardSemesterName, 'num', _semesterFilters.length)]]
					</button>
				</div>
				<div class="dropdown-content-tab" role="tab" aria-controls="departmentsTab" hidden$="[[_departmentsTabHidden]]">
					<div class="dropdown-content-tab-highlight" hidden$="[[!_departmentsTabSelected]]"></div>
					<button id="departmentsTabButton" class="dropdown-content-tab-button" on-tap="_selectTab" data-tab-name="departments" aria-pressed="false">
						[[localize('filtering.filterLabel', 'filterLabel', filterStandardDepartmentName, 'num', _departmentFilters.length)]]
					</button>
				</div>
				<div class="dropdown-content-tab" role="tab" aria-controls="rolesTab" hidden$="[[_rolesTabHidden]]">
					<div class="dropdown-content-tab-highlight" hidden$="[[!_rolesTabSelected]]"></div>
					<button id="rolesTabButton" class="dropdown-content-tab-button" on-tap="_selectTab" data-tab-name="roles" aria-pressed="false">
						[[localize('filtering.filterLabel', 'filterLabel', filterRolesName, 'num', _roleFiltersCount)]]
					</button>
				</div>
			</div>
		</div>

		<iron-pages attr-for-selected="data-tab-name" selected="semesters" fallback-selection="semesters">
			<d2l-filter-menu-tab
				id="semestersTab"
				data-tab-name="semesters"
				aria-labelledby="semestersTabButton"
				menu-label-text="[[filterStandardSemesterName]]"
				no-filters-text="[[localize('filtering.noSemesters', 'semester', filterStandardSemesterName)]]" search-action="[[_searchSemestersAction]]"
				search-placeholder-text="[[localize('filtering.searchBy', 'filter', filterStandardSemesterName)]]"
				selected-filters="{{_semesterFilters}}"
				hidden$="[[_semestersTabHidden]]">
			</d2l-filter-menu-tab>

			<d2l-filter-menu-tab
				id="departmentsTab"
				data-tab-name="departments"
				aria-labelledby="departmentsTabButton"
				menu-label-text="[[filterStandardDepartmentName]]"
				no-filters-text="[[localize('filtering.noDepartments', 'department', filterStandardDepartmentName)]]"
				search-action="[[_searchDepartmentsAction]]"
				search-placeholder-text="[[localize('filtering.searchBy', 'filter', filterStandardDepartmentName)]]"
				selected-filters="{{_departmentFilters}}"
				hidden$="[[_departmentsTabHidden]]">
			</d2l-filter-menu-tab>

			<d2l-filter-menu-tab-roles
				id="rolesTab"
				data-tab-name="roles"
				aria-labelledby="rolesTabButton"
				no-filters-text="[[localize('filtering.noRoles')]]"
				my-enrollments-entity="[[myEnrollmentsEntity]]"
				hidden$="[[_rolesTabHidden]]">
			</d2l-filter-menu-tab-roles>
		</iron-pages>`;
	}

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('role-filters-changed', this._onRoleFiltersChanged);
		this.addEventListener('selected-filters-changed', this._onDepartmentOrSemesterFiltersChanged);

		this.filterRolesName = this.localize('filtering.roles');
	}

	open() {
		const defaultTab = !this._semestersTabHidden
			? 'semesters'
			: !this._departmentsTabHidden ? 'departments' : 'roles';

		this._selectTab({ target: { dataset: { tabName: defaultTab }}});

		return Promise.all([
			this.$.semestersTab.load(),
			this.$.departmentsTab.load()
		]);
	}
	clearFilters() {
		this.$.semestersTab.clear();
		this.$.departmentsTab.clear();
		this.$.rolesTab.clear();

		this._roleFiltersCount = 0;

		// Clear button is removed via dom-if, so need to manually set focus to next element
		if (this._semestersTabSelected) {
			this.$.semestersTabButton.focus();
		} else if (this._departmentsTabSelected) {
			this.$.departmentsTabButton.focus();
		} else {
			this.$.rolesTabButton.focus();
		}

		if (!this._searchMyEnrollmentsAction) {
			// When initially loading, everything is already cleared anyway
			return;
		}

		const params = {};
		if (!this._semestersTabHidden || !this._departmentsTabHidden) {
			// Only clear semesters/departments when My Courses is grouped by role
			params.parentOrganizations = '';
		}
		if (!this._rolesTabHidden) {
			// Only clear roles when My Courses is grouped by semester/department
			params.roles = '';
		}

		const searchUrl = createActionUrl(this._searchMyEnrollmentsAction, params);

		this.fire('d2l-filter-menu-change', {
			url: searchUrl,
			filterCounts: {
				departments: 0,
				semesters: 0,
				roles: 0
			}
		});
	}
	_onRoleFiltersChanged(e) {
		this._roleFiltersCount = e.detail.filterCount;

		this.fire('d2l-filter-menu-change', {
			url: e.detail.url,
			filterCounts: {
				departments: this._departmentFilters.length,
				semesters: this._semesterFilters.length,
				roles: this._roleFiltersCount
			}
		});
	}
	_onDepartmentOrSemesterFiltersChanged() {
		if (!this._semesterFilters || !this._departmentFilters || !this._searchMyEnrollmentsAction) {
			return;
		}

		const departmentSemesterFilters = this._semesterFilters.concat(this._departmentFilters);

		const searchUrl = createActionUrl(this._searchMyEnrollmentsAction, {
			orgUnitTypeId: this.orgUnitTypeIds,
			parentOrganizations: departmentSemesterFilters.join(',')
		});

		this.fire('d2l-filter-menu-change', {
			url: searchUrl,
			filterCounts: {
				departments: this._departmentFilters.length,
				semesters: this._semesterFilters.length,
				roles: this._roleFiltersCount
			}
		});
	}
	_myEnrollmentsEntityChanged(myEnrollmentsEntity) {
		myEnrollmentsEntity = parseEntity(myEnrollmentsEntity);

		if (myEnrollmentsEntity.hasActionByName(Actions.enrollments.searchMySemesters)) {
			this._searchSemestersAction = myEnrollmentsEntity.getActionByName(Actions.enrollments.searchMySemesters);
		}

		if (myEnrollmentsEntity.hasActionByName(Actions.enrollments.searchMyDepartments)) {
			this._searchDepartmentsAction = myEnrollmentsEntity.getActionByName(Actions.enrollments.searchMyDepartments);
		}

		if (myEnrollmentsEntity.hasActionByName(Actions.enrollments.searchMyEnrollments)) {
			this._searchMyEnrollmentsAction = myEnrollmentsEntity.getActionByName(Actions.enrollments.searchMyEnrollments);
		}

		this._hideInvalidSearchTabs();
	}
	_selectTab(e) {
		const tabName = e.target.dataset.tabName;

		this.shadowRoot.querySelector('iron-pages').select(tabName);

		this._semestersTabSelected = tabName === 'semesters';
		this._departmentsTabSelected = tabName === 'departments';
		this._rolesTabSelected = tabName === 'roles';

		this.$.semestersTab.resize();
		this.$.departmentsTab.resize();
		this.$.rolesTab.resize();

		this.$.semestersTabButton.setAttribute('aria-pressed', this._semestersTabSelected);
		this.$.departmentsTabButton.setAttribute('aria-pressed', this._departmentsTabSelected);
		this.$.rolesTabButton.setAttribute('aria-pressed', this._rolesTabSelected);
	}
	_tabSearchTypeChanged() {
		this._hideInvalidSearchTabs();
	}
	_hideInvalidSearchTabs() {
		// If My Courses is grouped by semesters/departments, don't show either of these tabs
		const semesterOrDepartmentGrouping = this.tabSearchType === 'BySemester' || this.tabSearchType === 'ByDepartment';
		this._semestersTabHidden = semesterOrDepartmentGrouping || !this._searchSemestersAction;
		this._departmentsTabHidden = semesterOrDepartmentGrouping || !this._searchDepartmentsAction;
		// If My Courses is grouped by role alias, don't show the Role tab
		this._rolesTabHidden = this.tabSearchType === 'ByRoleAlias';
	}
	_computeHasFilters(departmentFiltersLength, semesterFiltersLength, roleFiltersCount) {
		return departmentFiltersLength + semesterFiltersLength + roleFiltersCount > 0;
	}
}

window.customElements.define(FilterMenu.is, FilterMenu);
