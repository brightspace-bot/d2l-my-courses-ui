/* global describe, it, expect, fixture, before, beforeEach */

'use strict';

describe('d2l-utility-behavior', function() {
	var
		component,
		enrollment = {
			class: ['pinned', 'enrollment'],
			rel: ['https://api.brightspace.com/rels/user-enrollment'],
			actions: [{
				name: 'unpin-course',
				method: 'PUT',
				href: '/enrollments/users/169/organizations/1',
				fields: [{
					name: 'pinned',
					type: 'hidden',
					value: false
				}]
			}],
			links: [{
				rel: ['https://api.brightspace.com/rels/organization'],
				href: '/organizations/1'
			}, {
				rel: ['self'],
				href: '/enrollments/users/169/organizations/1'
			}]
		},
		enrollmentEntity;

	before(function() {
		var parser = document.createElement('d2l-siren-parser');
		enrollmentEntity = parser.parse(enrollment);
	});

	beforeEach(function() {
		component = fixture('default-fixture');
	});

	it('should get the unique enrollment ID based off the self link', function() {
		var id = component.getEnrollmentIdentifier(enrollmentEntity);

		expect(id).to.equal(enrollment.links[1].href);
	});
});