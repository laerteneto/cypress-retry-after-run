describe('Spec 1', () => {
  it('Test 1 - Pass', () => {
    cy.wrap(true).should('be.true');
  });

  it('Test 2 - Fail', () => {
    cy.wrap(false).should('be.true');
  });

  it('Test 3 - Pass', () => {
    cy.wrap(true).should('be.true');
  });
});
