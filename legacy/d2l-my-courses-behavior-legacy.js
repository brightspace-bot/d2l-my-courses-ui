import '@polymer/polymer/polymer-legacy.js';
import { Rels } from 'd2l-hypermedia-constants';
import { Actions } from 'd2l-hypermedia-constants';
import './d2l-utility-behavior-legacy.js';
import './localize-behavior-legacy.js';
window.D2L = window.D2L || {};
window.D2L.MyCourses = window.D2L.MyCourses || {};

/*
* TODO: This was a Common behavior shared between d2l-my-courses-container and d2l-my-courses-legacy.
* Now that the code path has been split, this can be merged back into d2l-my-courses-legacy.
*
* @polymerBehavior D2L.MyCourses.MyCoursesBehaviorLegacy
*/
D2L.MyCourses.MyCoursesBehaviorLegacyImpl = {
	properties: {
		// URL that directs to the advanced search page
		advancedSearchUrl: String,
		// URL that is called by the widget to fetch enrollments
		enrollmentsUrl: String,
		// URL that is called by the widget to fetch results from the course image catalog
		imageCatalogLocation: String,
		// Configuration value passed in to toggle course code -- passed to animation tile
		showCourseCode: Boolean,
		// Configuration value passed in to toggle Learning Paths code
		orgUnitTypeIds: String,
		// Configuration value passed in to toggle semester on course tile -- passed to animation tile
		showSemester: Boolean,
		// Standard Semester OU Type name to be displayed in the all-courses filter dropdown
		standardDepartmentName: String,
		// Standard Department OU Type name to be displayed in the all-courses filter dropdown
		standardSemesterName: String,
		// Types of notifications to include in update count in course tile -- passed to animation tile
		courseUpdatesConfig: Object,
		// Callback for upload in image-selector
		courseImageUploadCb: Function,
		// URL to fetch promoted searches for tabs
		promotedSearches: String,
		// URL to fetch a user's settings (e.g. default tab to select)
		userSettingsUrl: String,
		// URL to fetch widget settings
		presentationUrl: String,
		// Feature flag (switch) for using the updated sort logic and related fetaures
		updatedSortLogic: {
			type: Boolean,
			value: false
		},
		currentTabId: String,
		_enrollmentsSearchAction: Object,
		_pinnedTabAction: Object,
		_showGroupByTabs: {
			type: Boolean,
			computed: '_computeShowGroupByTabs(_tabSearchActions)'
		},
		_tabSearchActions: {
			type: Array,
			value: []
		},
		_tabSearchType: String,
		_changedCourseEnrollment: Object,
		_updateUserSettingsAction: Object
	},
	_computeShowGroupByTabs: function(groups) {
		return groups.length >= 2 || (groups.length > 0 && !this._enrollmentsSearchAction);
	},
	listeners: {
		'd2l-course-enrollment-change': '_onCourseEnrollmentChange',
		'd2l-tab-changed': '_tabSelectedChanged'
	},
	attached: function() {
		if (!this.enrollmentsUrl || !this.userSettingsUrl) {
			return;
		}

		Promise.all([
			this.fetchSirenEntity(this.enrollmentsUrl),
			this.fetchSirenEntity(this.userSettingsUrl)
		])
			.then(function(values) {
				var enrollmentsRootEntity = values[0];
				var userSettingsEntity = values[1];

				if (enrollmentsRootEntity.hasActionByName(Actions.enrollments.searchMyEnrollments)) {
					this._enrollmentsSearchAction = enrollmentsRootEntity.getActionByName(Actions.enrollments.searchMyEnrollments);
				}

				if (enrollmentsRootEntity.hasActionByName(Actions.enrollments.searchMyPinnedEnrollments)) {
					this._pinnedTabAction = enrollmentsRootEntity.getActionByName(Actions.enrollments.searchMyPinnedEnrollments);
				}

				if (userSettingsEntity && userSettingsEntity.hasLinkByRel(Rels.widgetSettings)) {
					this.presentationUrl = userSettingsEntity.getLinkByRel(Rels.widgetSettings).href;
				}

				this._updateUserSettingsAction = userSettingsEntity.getActionByName(Actions.enrollments.updateUserSettings);
			}.bind(this))
			.then(this._fetchTabSearchActions.bind(this));
	},
	_onCourseEnrollmentChange: function(e) {
		this._changedCourseEnrollment = {
			orgUnitId: e.detail.orgUnitId,
			isPinned: e.detail.isPinned
		};
	},
	_tabSelectedChanged: function(e) {
		this.currentTabId = `panel-${e.detail.tabId}`;
	},
	courseImageUploadCompleted: function(success) {
		return this._fetchContentComponent().courseImageUploadCompleted(success);
	},
	getLastOrgUnitId: function() {
		return this._fetchContentComponent().getLastOrgUnitId();
	},
	_fetchContentComponent: function() {
		return this.updatedSortLogic
			? (this._showGroupByTabs === false || !this.currentTabId
				? this.$$('d2l-my-courses-content')
				: this.$$(`#${this.currentTabId} d2l-my-courses-content`))
			: this.$$('d2l-my-courses-content-animated');
	},
	_fetchTabSearchActions: function() {
		if (!this.userSettingsUrl) {
			return;
		}

		if (!this.promotedSearches && this._enrollmentsSearchAction && this._pinnedTabAction) {
			return this.fetchSirenEntity(this.userSettingsUrl).then(function(value) {
				var lastEnrollmentsSearchName = value
						&& value.properties
						&& value.properties.MostRecentEnrollmentsSearchName;

				this._tabSearchActions = [{
					name: this._enrollmentsSearchAction.name,
					title: this.localize('allTab'),
					selected: this._enrollmentsSearchAction.name === lastEnrollmentsSearchName,
					enrollmentsSearchAction: this._enrollmentsSearchAction
				}, {
					name: this._pinnedTabAction.name,
					title: this.localize('pinnedCourses'),
					selected: this._pinnedTabAction.name === lastEnrollmentsSearchName,
					enrollmentsSearchAction: this._pinnedTabAction
				}];
			}.bind(this));
		}

		return Promise.all([
			this.fetchSirenEntity(this.promotedSearches, this.token),
			this.fetchSirenEntity(this.userSettingsUrl, this.token)
		]).then(function(values) {
			var promotedSearchesEntity = values[0];
			var userSettingsEntity = values[1];

			this._tabSearchActions = [];

			if (!promotedSearchesEntity) {
				return;
			}

			if (promotedSearchesEntity.properties) {
				this._tabSearchType = promotedSearchesEntity.properties.UserEnrollmentsSearchType;
			}

			if (!promotedSearchesEntity.actions) {
				return;
			}

			var lastEnrollmentsSearchName = userSettingsEntity
						&& userSettingsEntity.properties
						&& userSettingsEntity.properties.MostRecentEnrollmentsSearchName;

			if (promotedSearchesEntity.actions.length > 1) {
				this._tabSearchActions = promotedSearchesEntity.actions.map(function(action) {
					return {
						name: action.name,
						title: action.title,
						selected: action.name === lastEnrollmentsSearchName,
						enrollmentsSearchAction: action
					};
				});
			}

			if (!this._enrollmentsSearchAction) {
				return;
			}

			var actions = [{
				name: this._enrollmentsSearchAction.name,
				title: this.localize('allTab'),
				selected: this._enrollmentsSearchAction.name === lastEnrollmentsSearchName,
				enrollmentsSearchAction: this._enrollmentsSearchAction
			}];

			if (this._pinnedTabAction) {
				actions = actions.concat({
					name: this._pinnedTabAction.name,
					title: this.localize('pinnedCourses'),
					selected: this._pinnedTabAction.name === lastEnrollmentsSearchName,
					enrollmentsSearchAction: this._pinnedTabAction
				});
			}

			this._tabSearchActions = actions.concat(this._tabSearchActions);

		}.bind(this));
	}
};

/*
* @polymerBehavior D2L.MyCourses.MyCoursesBehaviorLegacy
*/
D2L.MyCourses.MyCoursesBehaviorLegacy = [
	D2L.PolymerBehaviors.MyCourses.LocalizeBehaviorLegacy,
	D2L.MyCourses.UtilityBehaviorLegacy,
	D2L.MyCourses.MyCoursesBehaviorLegacyImpl
];
