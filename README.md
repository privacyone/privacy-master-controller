# Privacy Master Controller

![Shield](misc/shield.png "Shield")

Privacy Master Controller (**PMC**) is, on the surface level, an interface within [Breeze](../../../breeze-core) for quick access to useful privacy and security settings and information as well as a gateway to `Dashboard`.

## Description

This is an integrated `browser extension` used to control **global** settings of internal privacy and security extensions<sup><b>*</b></sup> within `Breeze` as well as display the count of tracking attempts blocked per site.
Users can access these features, including `Dashboard`, using the popup interface. 

<sup><b>*</b></sup> In further text, any mention of other extensions will refer to their respective implementation explained in [`Supporting Extensions`](../../../supporting-extensions).
## Interface
![Popup](misc/pmc.png "Popup")

### Popup Elements
1. **Tracking attempts blocked on this site**
  Displays the current amount of blocked elements by `uBlock`, `Privacy Badger` and `ClearURLs` for the tab the popup is opened on.
2. **Master Toggle**
    Displays and controls the state of PMC.
    The state is defined as "in-use" if at least one toggle is active, "off" otherwise.
    If toggled while being "in-use", it will deactivate all active toggles.
    If toggled while "off", it will activate all three toggles.
    Initiates a 1s tab refresh timer upon being toggled.

3. **Privacy, Security and Cosmetic Toggles**
    * Privacy Toggle 
      Enables/Disables  `ClearURLs` and `Privacy Badger`.
      Enables/Disables the following `filter lists` [[1]](#1) in `uBlock`. 
      * [`adguard-generic`](#)
      * [`ublock-filters`](#)
      * [`ublock-privacy`](#)
      * [`adguard-spyware`](#)
      * [`easyprivacy`](#)
      * [`ublock-unbreak`](#)
    * Security Toggle 
      Enables/Disables  `HTTPs Everywhere`.
      Enables/Disables the following `filter lists` in `uBlock`.
      * [`ublock-badware`](#)
      * [`disconnect-malvertising`](#)
      * [`malware-0`](#)
      * [`malware-1`](#)
      * [`spam404-0`](#)
      * [`ublock-abuse`](#)
    * Cosmetic Toggle
      Enables/Disables the following `filter lists` in `uBlock`.
      * [`block-the-eu-cookie-shit-list`](#)
      * [`ADBlock`](#)

    A 3s tab refresh timer is initiated upon any of the three being toggled.

4. **View Dashboard**<br>
Opens `Dashboard` (located at _breeze://dashboard_ ) in a new tab.

## Integration into Breeze
PMC is installed during the build phase of Breeze. <br>
This repository is used as a submodule in the [Breeze core](../../../breeze-core) repository.

The following [patches](../../../breeze-core) are used for its integration:
* [pmc-installer.patch](../../../breeze-core/patches/core/breeze/pmc-installer.patch)<br>
    Sets PMC to be installed during the build process as an integrated extension, sets the appropriate tooltip and disables right-click interaction.

* [pmc-positioning.patch](../../../breeze-core/patches/core/breeze/pmc-positioning.patch)<br>
    Sets the position of the PMC `browser action` [[2]](#2) to be on the left side of the `omnibox`.

    ![Browser Action](misc/omni.png "Browser Action")

## Permissions
Although Breeze users will not be prompted to acknowledge and accept the use of these permissions by PMC as they would with regular (e.g. Chrome Webstore) extensions due to it being an integrated extension, it is still imperative to make privacy-related information crystal clear.
These are the `permissions` [[3]](#3) required by PMC for it to work as intended:

    "permissions": [
      "storage",
      "tabs",
      "management",
      "browsingData"
    ],
   These permissions allow access to their respective APIs which PMC uses in the following way:
   
**`storage`** [[4]](#4)
- Save and load toggle values for the popup menu initialization.
- Monitor changes to toggle values for global synchronization of the popup menu.

[View usage](https://github.com/privacyone/privacy-master-controller/search?q=chrome.storage&type=code)

**`tabs`** [[5]](#5)
- Perform tab queries to relay information to and from internal privacy and security extensions based on tab IDs.
- Communicate with PMC's `content script` [[6]](#6) responsible for aggregating and providing block count information for each eligible tab to the popup. 
- Create a new tab (View Dashboard).

[View usage](https://github.com/privacyone/privacy-master-controller/search?q=chrome.tabs&type=code)

**`management`** [[7]](#7)
- Enable/Disable internal privacy and security extensions

[View usage](https://github.com/privacyone/privacy-master-controller/search?q=chrome.management&type=code)

**`browsingData`** [[8]](#8)
- Delete `cache` and `cacheStorage` data for a specified `host`. (This happens when the aforementioned delayed refresh upon toggle interaction is initiated. The `host` is the page that was in the "background" while the toggle interaction occurred.)

[View usage](https://github.com/privacyone/privacy-master-controller/search?q=chrome.browsingData&type=code)

## References
<a id="1">[1]</a> uBlock Wiki: [Filter lists](https://github.com/gorhill/uBlock/wiki/Dashboard:-Filter-lists)

<a id="2">[2]</a> Chrome Developers API Reference: [chrome.browserAction](https://developer.chrome.com/docs/extensions/reference/browserAction/)

<a id="3">[3]</a> Chrome Developers API Reference: [Declare permissions](https://developer.chrome.com/docs/extensions/mv2/declare_permissions/)

<a id="4">[4]</a> Chrome Developers API Reference: [chrome.storage](https://developer.chrome.com/docs/extensions/reference/storage/)

<a id="5">[5]</a> Chrome Developers API Reference: [chrome.tabs](https://developer.chrome.com/docs/extensions/reference/tabs/)

<a id="6">[6]</a> Chrome Developers API Reference: [Content scripts](https://developer.chrome.com/docs/extensions/mv2/content_scripts/)

<a id="6">[7]</a> Chrome Developers API Reference: [chrome.management](https://developer.chrome.com/docs/extensions/reference/management/)

<a id="7">[8]</a> Chrome Developers API Reference: [chrome.browsingData](https://developer.chrome.com/docs/extensions/reference/browsingData/)

## License

See [LICENSE](LICENSE)