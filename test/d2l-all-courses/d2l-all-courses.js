/* global describe, it, beforeEach, afterEach, fixture, expect, sinon */

'use strict';

describe('smoke test', function() {
	var server,
		parser = document.createElement('d2l-siren-parser'),
		widget,
		pinnedCourses = {
			class: ['enrollments'],
			rel: ['enrollments'],
			links: [],
			actions: [],
			properties: {},
			entities: [{
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [
						'preferences',
						'pinned'
					],
					properties: {
						'pinDate': '2016-06-18T16:36:05Z'
					}
				}],
				properties: {
					name: 'Course 2',
					id: 2
				},
				links: []
			}, {
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [
						'preferences',
						'pinned'
					],
					properties: {
						'pinDate': '2016-06-18T16:35:05Z'
					}
				}],
				properties: {
					name: 'Course 4',
					id: 4
				},
				links: []
			}]
		},
		unpinnedCourses = {
			class: ['enrollments'],
			rel: ['enrollments'],
			links: [],
			actions: [],
			properties: {},
			entities: [{
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [],
					properties: { }
				}],
				properties: {
					name: 'Course 1',
					id: 1
				},
				links: []
			}, {
				class: ['course-offering', 'active'],
				rel: ['enrollment'],
				entities: [{
					rel: ['preferences'],
					class: [],
					properties: { }
				}],
				properties: {
					name: 'Course 3',
					id: 3
				},
				links: []
			}]
		},
		courseEntity = {
			properties: {
				name: 'Test Name'
			}
		};

	beforeEach(function() {
		server = sinon.fakeServer.create();

		widget = fixture('d2l-all-courses-fixture');

		var pinnedEnrollmentsEntity,
			unpinnedEnrollmentsEntity;
		pinnedEnrollmentsEntity = parser.parse(pinnedCourses);
		unpinnedEnrollmentsEntity = parser.parse(unpinnedCourses);
		widget.pinnedCoursesEntities = pinnedEnrollmentsEntity.entities;
		widget.unpinnedCoursesEntities = unpinnedEnrollmentsEntity.entities;
	});

	afterEach(function() {
		server.restore();
	});

	it('should load', function() {
		expect(widget).to.exist;
	});

	describe('A11Y', function() {
		it('should announce when course is pinned', function() {
			var event = new CustomEvent('course-pinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been pinned');
		});

		it('should announce when course is unpinned', function() {
			var event = new CustomEvent('course-unpinned', {
				detail: {
					course: courseEntity
				}
			});
			widget.dispatchEvent(event);
			expect(widget.ariaMessage).to.equal(courseEntity.properties.name + ' has been unpinned');
		});
	});

	describe('Course entity management', function() {
		it('should move an unpinned course to the pinned list when pinned', function() {
			var course = {
				properties: {
					id: 1
				}
			};

			widget._moveCourseToPinnedList(course);
			expect(widget.pinnedCoursesEntities.length).to.equal(3);
			expect(widget.unpinnedCoursesEntities.length).to.equal(1);
			expect(widget.pinnedCoursesEntities[0].properties.id).to.equal(1);
		});

		it('should move a pinned course to the unpinned list when unpinned', function() {
			var course = {
				properties: {
					id: 2
				}
			};

			widget._moveCourseToUnpinnedList(course);
			expect(widget.pinnedCoursesEntities.length).to.equal(1);
			expect(widget.unpinnedCoursesEntities.length).to.equal(3);
			expect(widget.unpinnedCoursesEntities[0].properties.id).to.equal(2);
		});

		it('should pin a course whose removal animation has completed, and add it to the beginning of the pinned courses list', function() {
			widget._tilesInPinStateTransition.push(1);

			var pinAnimationEvent = new CustomEvent('tile-remove-complete', {
				detail: {
					course: widget.unpinnedCoursesEntities[0],
					pinned: true
				}
			});

			widget.dispatchEvent(pinAnimationEvent);
			expect(widget.pinnedCoursesEntities.length).to.equal(3);
			expect(widget.unpinnedCoursesEntities.length).to.equal(1);
			expect(widget.pinnedCoursesEntities[0].properties.id).to.equal(1);
		});

		it('should unpin a course whose removal animation has completed, and add it to the beginning of the unpinned courses list', function() {
			widget._tilesInPinStateTransition.push(2);

			var pinAnimationEvent = new CustomEvent('tile-remove-complete', {
				detail: {
					course: widget.pinnedCoursesEntities[0],
					pinned: false
				}
			});

			widget.dispatchEvent(pinAnimationEvent);
			expect(widget.pinnedCoursesEntities.length).to.equal(1);
			expect(widget.unpinnedCoursesEntities.length).to.equal(3);
			expect(widget.unpinnedCoursesEntities[0].properties.id).to.equal(2);
		});
	});
});
