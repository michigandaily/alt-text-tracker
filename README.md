# alt-text-tracker

The `a11y.js` script runs every day to count the total number of images published to The Michigan Daily, and the number of images with alternative text. If a data file does not already exist, the script will retrieve counts since December 2022. Otherwise, the script will just retrieve data from within the last 24 hours, appending to the data file.

The script is generally accurate, though it does introduce mistakes from time to time. You can correct these mistakes by deleting the `data.csv` file and rerunning `a11y.js`.
