#env
@env_staging @env_prod

#browser
@browser_chrome @browser_edge @browser_webkit

#squad
@squad_search


Feature: User searches by keyword

    Scenario: User searches an item by one keyword
        Given a user on the search page
        When the user search a product by keyword
        Then the user gets a list of products matching the keyword

    Scenario: User searches an item by two keywords
        Given a user on the search page
        When the user search a product by two keywords
        Then the user gets a list of products matching the two keywords

    Scenario: User searches an item by non exisiting keyword
        Given a user on the search page
        When the user search a product by non exisiting keyword
        Then the user gets an empty state list