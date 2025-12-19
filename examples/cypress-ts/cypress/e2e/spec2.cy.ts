describe('Spec 2', () => {
    it('Test 1 - Pass', () => {
        cy.wrap(true).should('be.true');
    });

    it('Test 2 - Pass', () => {
        cy.wrap(true).should('be.true');
    });

    it('Test 3 - Fail', () => {
        cy.wrap(false).should('be.true');
    });
});
