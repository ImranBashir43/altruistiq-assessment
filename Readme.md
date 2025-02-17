# Altruistiq Fullstack Support Engineer hiring assessment

Welcome to Altruistiq! Thank you very much for taking the time to do this task. 🙏

### Objective

In this task you'll be debugging an application that consists of a backend and a frontend. 3 bugs have been reported that you need to fix.

**About this application**<br/>
The application backend fetches emission data per year, per country from the [FootPrint Network Api](https://data.footprintnetwork.org/#/api). It transforms the data and exposes it via an api to the frontend.

The frontend fetches the data, and renders an animated chart. It loops through the years, and for each year it shows a sorted chart with emission per country. That way the user can see for every year which country is the highest emitting country!

The result is something like this but then for emissions:

![https://miro.medium.com/max/1600/1*37uCN6y1WyLukxwCadhWRw.gif](https://miro.medium.com/max/1600/1*37uCN6y1WyLukxwCadhWRw.gif)

**Time scope**<br/>
We suggest to not spent more than 2 hours, but you're free to spend more time.

**AI usage**<br/>
We encourage you to _not use AI_; you should be showing of your skills and expertise, not an LLM's. Also in the support role that you're applying for, AI is only of limited use, and strong dependency on AI will stop you from being successful in this role.

However if you choose to use AI we'd like you to be transparent about it and explain how you used it, for example sharing the prompts in the post-mortem, really showing how you use it as a tool to debug or fix cases.

### Get Started

### Install

Clone this repo, then

```bash
cd api && npm i
cd client && npm i
```

### Set env secret

In the `api` folder rename `.env.example` to `.env` and paste the secret that you've received from us.

### Run

Code automatically reloads upon code changes.
The backend runs on port 5010, the frontend runs on http://localhost:5173

```bash
cd api && npm run dev
cd client && npm run dev
```

### Run tests

The client uses Vitest and the api uses Mocha. Code and tests are being watched so automatically reruns.

```bash
cd api && npm test
cd client && npm test
```

# Tasks

Please read through all the tasks to understand the full scope of this assessment.
Make sure to work in a new branch so you can create a PR.

## BUG REPORT 1: Chart is not always showing country emissions



## root cause 

the chart rendering logic did not wait for the data to be fully loaded before attempting to render.
the setInterval in the mounted lifecycle hook started immediately, causing race conditions.


## fix approach  

added a isDataLoaded flag to ensure the chart only renders when the data is fully loaded.
improved error handling in seeds.controller.js to return valid data even if some requests fail.
added a loading state to the UI to inform the user that data is being fetched.
ensured the setInterval only starts after the data is loaded.


## outcome 

The chart now renders consistently when the data is available.
The UI provides feedback to the user during data loading.

## BUG REPORT 2: Chart is not showing all countries


## root cause 

parallel requests issue in prepareEmissionsByCountry requests data for all countries in parallel using Promise.allSettled().
if too many requests fail or get rejected, only a subset of countries is processed.
if axios.get() in getDataForCountry() gets rate-limited by the API, it may return partial or empty responses.


## fix approach   

batch execution instead of all at once to avoid rate limiting
modify prepareEmissionsByCountry() to retry failed requests instead of skipping them.
Rate-limiting issues are handled, preventing missing data.
retries with exponential backoff before failing completely.


## outcome 

no countries will be omitted due to API failures or rate limits.


## BUG REPORT 3: Years are not looping

## root cause 
loop condition only resets if currentYear === maxYear
years were stored as string


## fix approach   

used loop condition currentYear >= maxYear
converted years to numbers



## outcome 
years reset to minYear after reaching maxYear
