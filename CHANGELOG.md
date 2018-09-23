# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


## Next version (to be released)

### Added
- If feature in mission has complex geometry (other than point), it is properly rendered on review page map
- In mission review, skipped features are not shown two times to the same user
- In mission statistics, a graph shows solved features amount evolution
- A link to code repository is present on homepage

### Changed
- Mission without integrated editor has dedicated icon in missions list
- In personnal mission page, details for each mission has a new layout, and mission completion is shown as bar diagram
- If OSM feature already has associated pictures, we don't change the related tag values
- If OSM feature already has a `survey:date` tag, we only change it if picture date is more recent than existing one
- In various statistics pages, contribution chart is renamed "Activity" chart

### Fixed
- When duplicating mission and changing editor, editor settings are now properly sent to back-end
- Mission having double-quotes in their name are now properly handled (fix in osm-request on XML special characters escaping)
- Missions not having statistics were sometimes creating an error in personal mission dashboard
- User is always redirected to original page after logging in (wasn't working if user landed directly on page needing authentication)
- Interface should not show again same feature if returned twice by API


## 0.4.12 - 2018-08-24

### Added
- Create new mission, the fast way, using templates
- In review page, picture gallery and response image list can be horizontally scrolled using mouse wheel
- In users leaderboard (general and per mission), current user ranking is always shown and highlighted
- Partial support for Japanese (ja) locale

### Changed
- Improved readability of error messages coming from API
- Creation date shown instead of update date in missions list and map
- Create mission link in page header redirects to a two entries page, allowing to choose mission creation tool (templates or scratch)
- On large screens, mission answers on review page can be shown as a multi-line grid if there are many possible answers
- Statistics page can be accessed only if logged-in
- In missions management page, when updating visibility status, a blocking loading is now shown (as API can take some delay to update due to caching system)


## 0.4.11 - 2018-08-09

### Added
- German (de) locale
- Mission management for users ("Your missions" in top-right corner user menu)
- Click on feature over map in review page makes its popup details appear
- Tooltip are shown when mouse is over one mission in missions page's map
- Amount of contributors for a mission is shown in mission list page
- After logging-in, user comes back to page he was coming from

### Changed
- Review page UI changed to make it clearer
- Feature name in review page handles properly advertising features
- Mission details map has better performance thanks to preferCanvas option in Leaflet

### Fixed
- Dependency failure related to babel package
- Background color on done mission in mission list


## 0.2.1 - 2018-01-03

### Fixed
- Exception in Firefox for Osmose dataset
- Missing label in I18n


## 0.2.0 - 2018-01-03

### Added
- Documentation for contributing/develop
- Documentation for JS classes/methods
- Unit test framework Mocha
- Osmose dataset for thematic reviews
- Previous and can't see buttons in review component
- About tab, explains project purpose

### Changed
- Merged webpack configuration files into a single one
- French translation files
- Generic dataset model introduced, controllers and views adapted


## 0.1.0 - 2017-12-20

### Added
- GeoJSON dataset support
- Summary component of review status
- Review component for editing review
