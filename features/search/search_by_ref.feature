#env
@env_staging @env_prod

#browser
@browser_chrome @browser_edge @browser_webkit

#squad
@squad_search


Feature: User searches by ref

    Scenario: User searches an item by exisiting ref
        Given a user on the search page
        When the user search a product by exisiting ref
        Then the user gets a detailed page of the product

    Scenario: User searches an item by non exisiting ref
        Given a user on the search page
        When the user search a product by non exisiting ref
        Then the user gets an empty state list