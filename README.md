# Time Hop

## Overview

Time Hop is a client-side JavaScript web application that allows users to store and revisit memories in the future. Users can create digital time capsules containing personal memories, photos, and messages, each with details such as a title, creation date, and unlock date. Users can browse their created capsules and track the time remaining until each one becomes available to open.

Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile project management, and demonstrates integration with Firebase backend services for storing user favorites.

---

## Features

- Create digital time capsules containing photos, memories, and messages
- Set unlock dates to determine when capsules can be opened
- Browse a list of created capsules with titles and countdown timers
- Manage and revisit saved memories once capsules are unlocked
- Responsive design for desktop and mobile

---

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend**: Firebase for hosting
- **Database**: Firestore

---

## Usage

To run the application locally:

1.  **Clone** the repository.
2.  **Install dependencies** by running `npm install` in the project root directory.
3.  **Start the development server** by running the command: `npm run dev`.
4.  Open your browser and visit the local address shown in your terminal (usually `http://localhost:5173` or similar).

Once the application is running:

1.  Make your first time capsule on the create page.
2.  Upload all the memories you want to the capsule.
3.  Seal and lock away your capsule.

---

## Project Structure

```
1800_202630_BBY03/
├── src/
│   ├── main.js
├── styles/
│   └── style.css
├── public/
├── images/
├── index.html
├── package.json
├── README.md
```

---

## Contributors

- **Shelly Vasudeva** - BCIT CST Student with a interest in cybersecurity.
- **Yan Yan** - BCIT CST Student interested in computers, love playing games.
- **James O'Neill** - BCIT CST Student with a passion for programming.

---

## Acknowledgments

- Time capsule content and sample memories are for demonstration purposes only.
- Code snippets were adapted from resources such as [Stack Overflow](https://stackoverflow.com/) and [MDN Web Docs](https://developer.mozilla.org/).
- Icons sourced from [FontAwesome](https://fontawesome.com/) and images from [Unsplash](https://unsplash.com/).

---

## Limitations and Future Work

### Limitations

- Limited customization options for individual time capsules.
- No ability to share capsules with other users.
- Accessibility features can be further improved.

### Future Work

- Implement the ability to share time capsules with friends and family.
- Add more customization options for capsule themes and layouts.
- Allow users to attach additional media, such as videos and audio recordings.
- Implement notifications for upcoming capsule unlock dates.
- Create a dark mode for better usability in low-light conditions.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
