describe('Spec 1', () => {
    it('passes 1', () => {
        cy.wrap(true).should('be.true')
    })

    it('passes 2', () => {
        cy.visit('https://example.cypress.io')
    })

    it('fails 1', () => {
        // Intentionally failing test
        cy.wrap(true).should('be.false')
    })
})
