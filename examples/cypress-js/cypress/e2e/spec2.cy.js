describe('Spec 2', () => {
    it('passes 1', () => {
        cy.wrap(true).should('be.true')
    })

    it('fails 2', () => {
        // Intentionally failing test
        cy.wrap(false).should('be.true')
    })

    it('passes 3', () => {
        cy.visit('https://example.cypress.io')
    })
})
