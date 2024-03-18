# Things to remember

-   React Firebase Hooks
-   [Momentum Scrolling](https://medium.com/@d_vsh/craft-a-smooth-momentum-scrolling-experience-with-react-and-framer-motion-72533d3cfc92)
-   [Delete Unverified Users After 24 Hours](https://stackoverflow.com/questions/67148672/how-to-delete-unverified-e-mail-addresses-in-firebase-authentication-flutter)

> **Note:** This project uses aliases for import for some of its directories. They can be found in `vite.config.js`
> The aliases are added in the `jsconfig.json` file for the editor to recognize them.

### TODO:

-   [x] Authentication
-   [x] Search Friends
-   [x] Invites
-   [x] Algolia Search
-   [x] Friends List
-   [ ] Add User Info Form
-   [ ] Settings Page
-   [ ] Profile Page
-   [ ] Chat
-   [ ] Notifications

#### Extra TODO:

-   [x] Seperate Server Routes and init file
-   [x] Generalize the auth required routes
-   [x] Animate Invites, SearchFriends
-   [x] Check CORS for socket server
-   [x] Think over on if all invitations should be stored in one collection rather than in the user's collection (User's Collection is already implemented)
-   [x] Think over the flow of Sign Up
-   [ ] Add username suggestions
-   [ ] Seperate socket routes
-   [ ] Optimize Error Parser and Handling in both client and server
-   [ ] Check how to handle multiple socket connections from the same user for same event
-   [ ] Add Powered By Icons
    -   [ ] Firebase
    -   [ ] Algolia
    -   [ ] Socket.io
-   [ ] Make a About Page or a Landing Page
-   [ ] Make a footer
-   [ ] Should I limit the number of invitations a user can see?
-   [ ] Link Previews
-   [ ] Spotify Integration
-   [ ] Developer API

### Accessibilities

-   [ ] Consider Translate Options (Firebase has a translate API)
-   [ ] Add aria-labels to buttons
-   [ ] Add alt to images
-   [ ] HTML Semantics
-   [ ] Keyboard Navigation
-   [ ] Focus Management
-   [ ] Screen Reader
-   [ ] Color Contrast
-   [ ] Font Size
-   [ ] Disable Animations
-   [ ] Add support for Dyslexia (Comic Sans, OpenDyslexic, etc.)
-   [ ] Add support for Color Blindness (Color Palette, etc.)

    > All This can be done using [Axe](https://www.deque.com/axe/)
    > Also Better to create a Setttings Page for this
