import { EnrollmentCollectionEntity } from 'siren-sdk/src/enrollments/EnrollmentCollectionEntity.js';

describe('d2l-my-courses-content', () => {
	let sandbox,
		clock,
		component,
		fetchStub,
		searchAction,
		miniSearchAction,
		enrollmentEntity,
		enrollmentsRootEntity,
		miniEnrollmentsRootEntity,
		enrollmentsSearchEntity,
		enrollmentsSearchPageTwoEntity,
		organizationEntity,
		oneEnrollmentSearchEntity,
		organizationEntityHydrated,
		updateUserSettingsAction;

	function SetupFetchStub(url, entity) {
		fetchStub.withArgs(sinon.match(url), sinon.match.string)
			.returns(Promise.resolve({entity: entity}));
	}

	beforeEach(done => {
		sandbox = sinon.sandbox.create();
		searchAction = {
			name: 'search-my-enrollments',
			method: 'GET',
			href: '/enrollments/users/169',
			fields: [
				{ name: 'search', type: 'search', value: '' },
				{ name: 'pageSize', type: 'number', value: 20 },
				{ name: 'embedDepth', type: 'number', value: 0 },
				{ name: 'sort', type: 'text', value: 'current' },
				{ name: 'autoPinCourses', type: 'checkbox', value: false },
				{ name: 'promotePins', type: 'checkbox', value: false }
			]
		},
		miniSearchAction = {
			name: 'search-my-enrollments',
			method: 'GET',
			href: '/enrollments/users/1',
			fields: [
				{ name: 'search', type: 'search', value: '' },
				{ name: 'sort', type: 'text', value: 'current' }
			]
		},
		enrollmentEntity = window.D2L.Hypermedia.Siren.Parse({
			class: ['enrollment'],
			links: [{
				rel: ['self'],
				href: '/enrollments/users/169/organizations/1'
			}, {
				rel: ['https://api.brightspace.com/rels/organization'],
				href: '/organizations/1'
			}]
		});
		organizationEntity = window.D2L.Hypermedia.Siren.Parse({
			properties: {
				name: 'Course One'
			},
			links: [{
				rel: ['self'],
				href: '/organizations/1'
			}]
		});
		organizationEntityHydrated = window.D2L.Hypermedia.Siren.Parse({
			properties: organizationEntity.properties,
			links: organizationEntity.links,
			entities: [{
				rel: ['https://api.brightspace.com/rels/organization-image'],
				class: ['course-image'],
				properties: {
					name: 'a_beautiful_image_of_paint'
				},
				links: [{
					'class': ['tile', 'low-density', 'max'],
					'rel': ['alternate'],
					'type': 'image/jpeg',
					'href': 'https://s.brightspace.com/course-images/images/5dd1c592-cf6b-4d13-8b9f-a538c19321c9/tile-low-density-max-size.jpg'
				}]
			}]
		});
		enrollmentsRootEntity = window.D2L.Hypermedia.Siren.Parse({
			actions: [searchAction]
		});
		miniEnrollmentsRootEntity = window.D2L.Hypermedia.Siren.Parse({
			actions: [miniSearchAction]
		});
		enrollmentsSearchEntity = window.D2L.Hypermedia.Siren.Parse({
			actions: [searchAction],
			entities: [{
				rel: ['https://api.brightspace.com/rels/user-enrollment'],
				class: ['enrollment', 'pinned'],
				href: '/enrollments/users/169/organizations/1',
				links: [{
					rel: ['self'],
					href: '/enrollments/users/169/organizations/1'
				}, {
					rel: ['https://api.brightspace.com/rels/organization'],
					href: '/organizations/1'
				}]
			}],
			links: [{
				rel: ['self'],
				href: '/enrollments/users/169'
			}, {
				rel: ['next'],
				href: '/enrollments/users/169?bookmark=2'
			}]
		});
		enrollmentsSearchPageTwoEntity = window.D2L.Hypermedia.Siren.Parse({
			actions: [searchAction],
			entities: [{
				rel: ['https://api.brightspace.com/rels/user-enrollment'],
				class: ['enrollment', 'pinned'],
				href: '/enrollments/users/169/organizations/2',
				links: [{
					rel: ['self'],
					href: '/enrollments/users/169/organizations/2'
				}, {
					rel: ['https://api.brightspace.com/rels/organization'],
					href: '/organizations/2'
				}]
			}],
			links: [{
				rel: ['self'],
				href: '/enrollments/users/169?bookmark=2'
			}]
		});
		oneEnrollmentSearchEntity = window.D2L.Hypermedia.Siren.Parse({
			actions: [searchAction],
			entities: [{
				rel: ['https://api.brightspace.com/rels/user-enrollment'],
				class: ['enrollment'],
				href: '/enrollments/users/1/organizations/1',
				links: [{
					rel: ['self'],
					href: '/enrollments/users/1/organizations/1'
				}, {
					rel: ['https://api.brightspace.com/rels/organization'],
					href: '/organizations/1'
				}]
			}],
			links: [{
				rel: ['self'],
				href: '/enrollments/users/1'
			}]
		});

		updateUserSettingsAction = {
			'href': '/user-settings',
			'name': 'update-user-settings',
			'method': 'PUT',
			'type': 'static'
		};

		fetchStub = sandbox.stub(window.D2L.Siren.EntityStore, 'fetch');
		SetupFetchStub(/\/enrollments$/, enrollmentsRootEntity);
		SetupFetchStub(/\/enrollment$/, miniEnrollmentsRootEntity);
		SetupFetchStub(/\/enrollments\/users\/169\/organizations\/1/, enrollmentEntity);
		SetupFetchStub(/\/enrollments\/users\/1\/organizations\/1/, enrollmentEntity);
		SetupFetchStub(/\/enrollments\/users\/169\/organizations\/2/, enrollmentEntity);
		SetupFetchStub(/\/organizations\/1$/, organizationEntity);
		SetupFetchStub(/\/organizations\/2$/, organizationEntity);
		SetupFetchStub(/\/organizations\/3$/, organizationEntity);
		SetupFetchStub(/\/organizations\/1\?embedDepth=1$/, organizationEntityHydrated);
		SetupFetchStub(/\/organizations\/2\?embedDepth=1$/, organizationEntityHydrated);
		SetupFetchStub(/\/organizations\/3\?embedDepth=1$/, organizationEntityHydrated);
		SetupFetchStub(/\/enrollments\/users\/169.*&.*$/, enrollmentsSearchEntity);
		SetupFetchStub(/\/enrollments\/users\/1.*&.*$/, oneEnrollmentSearchEntity);
		SetupFetchStub(/\/enrollments\/users\/169.*bookmark=2/, enrollmentsSearchPageTwoEntity);

		component = fixture('d2l-my-courses-content-fixture');
		component.token = 'fake';
		component.enrollmentsSearchAction = enrollmentsRootEntity.actions[0];
		component.updateUserSettingsAction = updateUserSettingsAction;

		setTimeout(() => {
			done();
		});
	});

	afterEach(() => {
		if (clock) {
			clock.restore();
		}
		sandbox.restore();
	});

	it('should properly implement a random assortment of properties', () => {
		expect(component).to.exist;
		expect(component._alertsView).to.be.an.instanceof(Array);
		expect(component._existingEnrollmentsMap).to.be.an('object');
		expect(component._nextEnrollmentEntityUrl).to.be.null;
		expect(component._orgUnitIdMap).to.be.an('object');
		expect(component._showContent).to.exist;
	});

	it('should reset enrollments related properties', () => {
		component._lastPinnedIndex = 10;
		component._existingEnrollmentsMap = { 1234: true };
		component._enrollments = [1234];
		component._numberOfEnrollments = 10;

		component._resetEnrollments();

		expect(component._lastPinnedIndex).to.equal(-1);
		expect(component._enrollments.length).to.equal(0);
		expect(component._numberOfEnrollments).to.equal(0);
		for (const key in component._existingEnrollmentsMap) {
			expect(component._existingEnrollmentsMap.hasOwnProperty(key)).to.be.false;
		}
	});

	describe('Set Refetch Enrollment Flag', () => {
		const newValue = { orgUnitId: 1234 };
		const href = '/enrollments/users/1';
		const fields = [
			{ name: 'search', type: 'search', value: '' },
			{ name: 'sort', type: 'text', value: 'current' }
		];

		beforeEach(() => {
			component._isRefetchNeeded = false;
			component._orgUnitIdMap = {};
			component.enrollmentsSearchAction = {
				name: 'test',
				href: href,
				fields: fields
			};
		});

		it('should set refetch when course enrollment changed and it is all tab', () => {
			component.enrollmentsSearchAction = {
				name: 'search-my-enrollments',
				href: href,
				fields: fields
			};
			component._onCourseEnrollmentChange(newValue);
			expect(component._isRefetchNeeded).to.be.true;
		});

		it('should set refetch when course enrollment changed and it is pinned tab', () => {
			component.enrollmentsSearchAction = {
				name: 'search-my-pinned-enrollments',
				href: href,
				fields: fields
			};
			component._onCourseEnrollmentChange(newValue);
			expect(component._isRefetchNeeded).to.be.true;
		});

		it('should set refetch when course enrollment changed and the search action contains this enrollment', () => {
			component._orgUnitIdMap = { 1234: true };
			component._onCourseEnrollmentChange(newValue);
			expect(component._isRefetchNeeded).to.be.true;
		});

		it('should not set refetch for other tabs', () => {
			component._onCourseEnrollmentChange(newValue);
			expect(component._isRefetchNeeded).to.be.false;
		});
	});

	describe('Card grid', () => {
		beforeEach((done) => {
			//component._fetchRoot();
			component._enrollmentsRootResponse(new EnrollmentCollectionEntity(enrollmentsSearchPageTwoEntity));
			setTimeout(done, 300);
		});

		it('should add the hide-past-courses attribute to the card grid in _populateEnrollments', () => {
			component._enrollmentsRootResponse(new EnrollmentCollectionEntity(enrollmentsSearchPageTwoEntity));
			expect(component.shadowRoot.querySelector('d2l-my-courses-card-grid').hidePastCourses).to.be.true;
		});

	});

	describe('Public API', () => {

		it('refreshCardGridImages should refresh cards in both card grids if all courses intialized', done => {
			component._createAllCourses();
			flush(() => {
				const stub1 = sandbox.stub(component.shadowRoot.querySelector('d2l-my-courses-card-grid'), 'refreshCardGridImages');
				const stub2 = sandbox.stub(component.shadowRoot.querySelector('d2l-all-courses'), 'refreshCardGridImages');

				component.refreshCardGridImages();
				expect(stub1).to.have.been.called;
				expect(stub2).to.have.been.called;
				done();
			});
		});

		it('refreshCardGridImages should refresh cards in just the widget view if all courses not intialized', done => {
			flush(() => {
				const stub1 = sandbox.stub(component.shadowRoot.querySelector('d2l-my-courses-card-grid'), 'refreshCardGridImages');

				component.refreshCardGridImages();
				expect(component.shadowRoot.querySelector('d2l-all-courses')).to.be.null;
				expect(stub1).to.have.been.called;
				done();
			});
		});

	});

	describe('Alerts', function() {
		it('should show and hide the course image failure alert depending on the value of showImageError', function() {
			const alertMessage = 'Sorry, we\'re unable to change your image right now. Please try again later.';
			component.showImageError = true;

			const alert = component.shadowRoot.querySelector('#imageErrorAlert');
			expect(alert.hidden).to.be.false;
			expect(alert.type).to.equal('warning');
			expect(alert.innerText).to.include(alertMessage);
			component.showImageError = false;
			expect(alert.hidden).to.be.true;
		});

		it('should hide the course image failure alert when the all courses overlay is opened', function(done) {
			const alertMessage = 'Sorry, we\'re unable to change your image right now. Please try again later.';
			component.showImageError = true;

			const alert = component.shadowRoot.querySelector('#imageErrorAlert');
			expect(alert.hidden).to.be.false;
			expect(alert.type).to.equal('warning');
			expect(alert.innerText).to.include(alertMessage);
			component._createAllCourses();
			flush(() => {
				component._openAllCoursesView(new CustomEvent('event'));
				expect(alert.hidden).to.be.true;
				expect(component.showImageError).to.be.false;
				done();
			});
		});

		it('should hide the course image failure alert when the all courses overlay is closed', function() {
			const alertMessage = 'Sorry, we\'re unable to change your image right now. Please try again later.';
			component.showImageError = true;

			const alert = component.shadowRoot.querySelector('#imageErrorAlert');
			expect(alert.hidden).to.be.false;
			expect(alert.type).to.equal('warning');
			expect(alert.innerText).to.include(alertMessage);

			const event = {
				type: 'd2l-simple-overlay-closed',
				composedPath: function() { return [{ id: 'all-courses' }]; }
			};
			component._onSimpleOverlayClosed(event);
			expect(alert.hidden).to.be.true;
			expect(component.showImageError).to.be.false;
		});
	});

	describe('Events', () => {

		describe('d2l-tab-panel-selected', () => {
			let parentComponent;

			beforeEach(() => {
				parentComponent = fixture('tab-event-fixture');
				component = parentComponent.querySelector('d2l-my-courses-content');
				component.token = 'fake';
				component.updateUserSettingsAction = updateUserSettingsAction;
				component.enrollmentsSearchAction = searchAction;
				component._numberOfEnrollments = 1;
				component.tabSearchActions = [];
				sandbox.stub(component, '_setLastSearchName');
			});

			[true, false].forEach(hasEnrollments => {
				it(`should ${hasEnrollments ? '' : 'not '}fetch enrollments`, () => {
					component._numberOfEnrollments = hasEnrollments ? 1 : 0;

					const stub = sandbox.stub(component, '_fetchRoot').returns(Promise.resolve());

					parentComponent.dispatchEvent(new CustomEvent(
						'd2l-tab-panel-selected', { bubbles: true, composed: true }
					));

					expect(stub.called).to.equal(!hasEnrollments);
				});
			});

			it('should update the tabSearchActions to select the currently-active tab', () => {
				component.tabSearchActions = [{
					name: searchAction.name,
					title: '',
					selected: false,
					enrollmentsSearchAction: searchAction
				}, {
					name: 'foo',
					title: '',
					selected: true,
					enrollmentsSearchAction: searchAction
				}];

				parentComponent.dispatchEvent(new CustomEvent(
					'd2l-tab-panel-selected', { bubbles: true, composed: true }
				));

				component.tabSearchActions.forEach(function(action) {
					expect(action.selected).to.equal(action.name !== 'foo');
				});
			});

			[true, false].forEach(refetchNeeded => {
				it(`should ${refetchNeeded ? '' : 'not '}refetch enrollments`, () => {
					component._isRefetchNeeded = refetchNeeded;

					const refetchStub = sandbox.stub(component, '_refetchEnrollments').returns(Promise.resolve());
					const resetStub = sandbox.stub(component, '_resetEnrollments');

					parentComponent.dispatchEvent(new CustomEvent(
						'd2l-tab-panel-selected', { bubbles: true, composed: true }
					));

					expect(refetchStub.called).to.equal(refetchNeeded);
					expect(resetStub.called).to.equal(refetchNeeded);
					expect(component._isRefetchNeeded).to.be.false;
				});
			});
		});

		describe('d2l-course-pinned-change', () => {

			it('should refetch enrollments if the new pinned enrollment has not previously been fetched', () => {
				const _enrollmentEntity = {
					_entity: {},
					organizationHref: function() { return 'organizationHref'; },
				};

				const event = new CustomEvent('d2l-course-pinned-change', {
					detail: {
						isPinned: true,
						enrollment: _enrollmentEntity
					}
				});

				component._orgUnitIdMap = {
					1: enrollmentEntity
				};

				const refetchSpy = sandbox.spy(component, '_refetchEnrollments');
				component._onEnrollmentPinnedMessage(event);
				setTimeout(() => {
					expect(refetchSpy).to.have.been.called;
				});
			});

		});

		describe('d2l-simple-overlay-closed', () => {

			it('should remove an existing course image failure alert', done => {
				const alertMessage = 'Sorry, we\'re unable to change your image right now. Please try again later.';
				component.showImageError = true;

				const alert = component.shadowRoot.querySelector('#imageErrorAlert');
				expect(alert.hidden).to.be.false;
				expect(alert.type).to.equal('warning');
				expect(alert.innerText).to.include(alertMessage);

				const event = {
					type: 'd2l-simple-overlay-closed',
					composedPath: function() { return [{ id: 'all-courses' }]; }
				};
				component._onSimpleOverlayClosed(event);

				setTimeout(() => {
					expect(component.showImageError).to.be.false;
					expect(alert.hidden).to.be.true;
					done();
				});
			});
		});

		describe('course-tile-organization', () => {

			it('should increase _courseTileOrganizationEventCount count', () => {
				const event = new CustomEvent('course-tile-organization');
				component.dispatchEvent(event);

				expect(component._courseTileOrganizationEventCount).to.equal(1);

			});

		});

		describe('course-image-loaded', () => {

			it('should increment the count of course images loaded', done => {
				expect(component._courseImagesLoadedEventCount).to.equal(0);

				const event = new CustomEvent('course-image-loaded');
				component.dispatchEvent(event);

				requestAnimationFrame(() => {
					expect(component._courseImagesLoadedEventCount).to.equal(1);
					done();
				});
			});

		});

		describe('initially-visible-course-tile', () => {

			it('should increment the count of initially visible course tiles', done => {
				expect(component._initiallyVisibleCourseTileCount).to.equal(0);

				const event = new CustomEvent('initially-visible-course-tile');
				component.dispatchEvent(event);

				requestAnimationFrame(() => {
					expect(component._initiallyVisibleCourseTileCount).to.equal(1);
					done();
				});
			});

		});

	});

	describe('Performance measures', () => {
		let stub;

		beforeEach(() => {
			stub = sandbox.stub(component, 'performanceMeasure');
		});

		it('should measure d2l.my-courses when all visible course tile images have loaded', done => {
			component.addEventListener('course-image-loaded', () => {
				expect(stub).to.have.been.calledWith(
					'd2l.my-courses',
					'd2l.my-courses.attached',
					'd2l.my-courses.visible-images-complete'
				);
				done();
			});
			component.addEventListener('initially-visible-course-tile', () => {
				requestAnimationFrame(() => {
					expect(component._initiallyVisibleCourseTileCount).to.equal(1);
					component.dispatchEvent(new CustomEvent('course-image-loaded'));
				});
			});

			expect(component._initiallyVisibleCourseTileCount).to.equal(0);
			component.dispatchEvent(new CustomEvent('initially-visible-course-tile'));
		});

		it('should measure d2l.my-courses.root-enrollments when the root enrollments call has finished', () => {
			component._fetchRoot();
			expect(stub).to.have.been.calledWith(
				'd2l.my-courses.root-enrollments',
				'd2l.my-courses.root-enrollments.request',
				'd2l.my-courses.root-enrollments.response'
			);
		});

		it('should measure d2l.my-courses.search-enrollments when the enrollment search call has finished', () => {
			sandbox.stub(component, '_onEnrollmentsRootEntityChange', () => {
				component._enrollmentsResponsePerfMeasures(new EnrollmentCollectionEntity(enrollmentsSearchPageTwoEntity));
			});

			component._fetchEnrollments();
			expect(stub).to.have.been.calledWith(
				'd2l.my-courses.search-enrollments',
				'd2l.my-courses.search-enrollments.request',
				'd2l.my-courses.search-enrollments.response'
			);
		});

	});

	describe('Fetching enrollments', () => {

		it('should hide the loading spinner if loading fails', () => {
			fetchStub.restore();

			component._enrollmentsRootResponse(new EnrollmentCollectionEntity());
			expect(component._showContent).to.be.true;

		});

		it('should hide the loading spinner if loading succeeds', () => {
			fetchStub.restore();

			SetupFetchStub(/\/enrollments$/, enrollmentsRootEntity);
			SetupFetchStub(/\/enrollments\/users\/169.*&.*$/, window.D2L.Hypermedia.Siren.Parse({
				actions: [searchAction],
				entities: [],
				links: [{
					rel: ['self'],
					href: '/enrollments/users/169'
				}]
			}));

			component._enrollmentsRootResponse(new EnrollmentCollectionEntity(enrollmentsRootEntity));
			expect(component._showContent).to.be.true;
		});

		it('should fetch enrollments using the constructed enrollmentsSearchUrl', () => {
			component._enrollmentsRootResponse(new EnrollmentCollectionEntity(enrollmentsRootEntity));
			expect(fetchStub).to.have.been.calledWith(sinon.match('autoPinCourses=false'));
			expect(fetchStub).to.have.been.calledWith(sinon.match('pageSize=20'));
			expect(fetchStub).to.have.been.calledWith(sinon.match('embedDepth=0'));
			expect(fetchStub).to.have.been.calledWith(sinon.match('sort=current'));
			expect(fetchStub).to.have.been.calledWith(sinon.match('promotePins=true'));
		});

		it('should fetch all pinned enrollments', done => {
			const spy = sandbox.stub(component, '_onEnrollmentsEntityChange', () => {
				component._populateEnrollments(new EnrollmentCollectionEntity(enrollmentsSearchPageTwoEntity));
			})
				.withArgs(sinon.match('/enrollments/users/169?bookmark=2'));

			component._populateEnrollments(new EnrollmentCollectionEntity(enrollmentsSearchEntity));
			setTimeout(() => {
				expect(spy).to.have.been.calledWith(
					sinon.match('/enrollments/users/169?bookmark=2')
				);
				done();
			});
		});

		it('should display the appropriate alert when there are no enrollments', () => {
			fetchStub.restore();
			component._enrollments = [];
			component._numberOfEnrollments = 0;

			SetupFetchStub(/\/enrollments$/, enrollmentsRootEntity);
			SetupFetchStub(/\/enrollments\/users\/169.*&.*$/, window.D2L.Hypermedia.Siren.Parse({
				actions: [searchAction],
				entities: [],
				links: [{
					rel: ['self'],
					href: '/enrollments/users/169'
				}]
			}));

			component._enrollmentsRootResponse(new EnrollmentCollectionEntity(enrollmentsRootEntity));
			expect(component._showContent).to.be.true;
			expect(component._numberOfEnrollments).to.equal(0);
			expect(component._alertsView).to.include({
				alertName: 'noCourses',
				alertType: 'call-to-action',
				alertMessage: 'You don\'t have any courses to display.'
			});
		});

		it('should update enrollment alerts when enrollment information is updated', () => {
			fetchStub.restore();
			component._enrollments = [];
			component._numberOfEnrollments = 0;

			SetupFetchStub(/\/enrollments$/, enrollmentsRootEntity);
			SetupFetchStub(/\/enrollments\/users\/169.*&.*$/, window.D2L.Hypermedia.Siren.Parse({
				actions: [searchAction],
				entities: [],
				links: [{
					rel: ['self'],
					href: '/enrollments/users/169'
				}]
			}));

			component._enrollmentsRootResponse(new EnrollmentCollectionEntity(enrollmentsRootEntity));
			expect(component._numberOfEnrollments).to.equal(0);
			expect(component._alertsView).to.include({
				alertName: 'noCourses',
				alertType: 'call-to-action',
				alertMessage: 'You don\'t have any courses to display.'
			});
			component._enrollments = ['/enrollments/users/169/organizations/1'];
			component._numberOfEnrollments = 1;
			expect(component._alertsView).to.be.empty;
		});

	});

	describe('With enrollments', () => {
		it('should correctly evaluate whether it has enrollments', () => {

			component._populateEnrollments(new EnrollmentCollectionEntity(oneEnrollmentSearchEntity));
			expect(component._numberOfEnrollments).not.to.equal(0);
		});

		it('should show the number of enrollments when there are no new pages of enrollments with the View All Courses link', () => {
			component._nextEnrollmentEntityUrl = null;
			component._numberOfEnrollments = 6;
			expect(component._viewAllCoursesText).to.equal('View All Courses (6)');
		});

		it('should show include "+" in the View All Courses link when there are more courses', () => {
			component._nextEnrollmentEntityUrl = 'enrollments/2';
			component._numberOfEnrollments = 6;
			expect(component._viewAllCoursesText).to.equal('View All Courses (6+)');
		});

		it('should round the number of courses in the View All Courses link when there are many courses', () => {
			component._nextEnrollmentEntityUrl = 'enrollments/2';
			component._numberOfEnrollments = 23;
			expect(component._viewAllCoursesText).to.equal('View All Courses (20+)');
		});

		describe('Only Past Courses alert', () => {
			beforeEach((done) => {
				component = fixture('d2l-my-courses-content-fixture');
				component.token = 'fake';
				component._populateEnrollments(new EnrollmentCollectionEntity(oneEnrollmentSearchEntity));

				setTimeout(() => {
					done();
				});
			});

			it('should not add the alert if not hiding past courses', () => {
				component._hidePastCourses = false;
				component.dispatchEvent(new CustomEvent(
					'd2l-enrollment-card-status', {
						bubbles: true,
						composed: true,
						detail: {
							status: { closed: true },
							enrollmentUrl: '/enrollments/users/1/organizations/1'
						}
					}
				));

				expect(component._hasOnlyPastCourses).to.be.false;

			});

		});

	});

	describe('Get Enrollment Card Status and Card Fetched', () => {
		let _enrollmentCollectionEntity;
		beforeEach((done) => {
			_enrollmentCollectionEntity = {
				_entity: oneEnrollmentSearchEntity,
				getEnrollmentEntities: function() { return [
					{
						href: null,
						hasClass: function() { return null; }
					}
				]; },
				hasMoreEnrollments: function() { return false; },
				getSearchEnrollmentsActions: function() { return null; },
			};
			component = fixture('d2l-my-courses-content-fixture');
			component.token = 'fake';
			setTimeout(() => {
				done();
			});
		});

		it('Should call _insertToOrgUnitIdMap', () => {
			const spy = sandbox.spy(component, '_insertToOrgUnitIdMap');
			component._populateEnrollments(_enrollmentCollectionEntity);
			expect(spy).to.have.been.called;
		});

		it('Should call _fetchEnrollmentCardStatus', () => {
			const spy = sandbox.spy(component, '_fetchEnrollmentCardStatus');
			component._populateEnrollments(_enrollmentCollectionEntity);
			expect(spy).to.have.been.called;
		});

	});

	describe('EnrollmentCollectionOnChange', () => {
		let _enrollmentCollectionEntity, _enrollmentEntity;
		beforeEach((done) => {
			const onUserActivityUsageChangeStub = sinon.stub();
			const onEnrollmentEntityChangeStub = sinon.stub();
			const onOrganizationChangeStub = sinon.stub();
			const isAfterEndDateStub = sinon.stub();
			_enrollmentCollectionEntity = {
				_entity: oneEnrollmentSearchEntity,
				getEnrollmentEntities: function() { return [
					{
						href: null,
						hasClass: function() { return null;}
					}
				]; },
				hasMoreEnrollments: function() { return false; },
				getSearchEnrollmentsActions: function() { return null; },
				onEnrollmentEntityChange: onEnrollmentEntityChangeStub,
			};

			_enrollmentEntity = {
				organizationHref: function() { return '/organizations/1'; },
				onOrganizationChange: onOrganizationChangeStub,
				onUserActivityUsageChange: onUserActivityUsageChangeStub
			};

			const userActivityUsageEntity = {
				isCompletionDate: function() { return true; },
				date: function() { return '1969-08-11T04:00:00.000Z'; }
			};

			const organizationEntity = {
				_entity: {},
				isAfterEndDate: isAfterEndDateStub
			};

			onEnrollmentEntityChangeStub.callsArgWith(1, _enrollmentEntity);
			onUserActivityUsageChangeStub.callsArgWith(0, userActivityUsageEntity);
			onOrganizationChangeStub.callsArgWith(0, organizationEntity);
			isAfterEndDateStub.returns(false);

			component = fixture('d2l-my-courses-content-fixture');
			component.token = 'fake';

			setTimeout(() => {
				done();
			});
		});

		it('Should call _setEnrollmentCardStatus', () => {
			const spy = sandbox.spy(component, '_setEnrollmentCardStatus');
			component._fetchEnrollmentCardStatus(1, _enrollmentCollectionEntity);
			expect(spy).to.have.been.calledTwice;
		});

		it('Should get _org properly', () => {
			component._insertToOrgUnitIdMap(1, _enrollmentCollectionEntity);
			expect(component._orgUnitIdMap['1']).to.equal(1);
		});

	});

});
