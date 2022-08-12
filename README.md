<h1 align="center"><i>Messenger</i></h1>

<div align="center">
  <img src="https://img.shields.io/github/package-json/v/mrkelder/messenger?style=for-the-badge" alt="version"/>
  <img src="https://img.shields.io/github/languages/code-size/mrkelder/messenger?style=for-the-badge" alt="code size"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="license"/>
</div>

<br />

An online messenger to chat with other users. This project is intended to demonstrate my web skills as to developing **WebSocket** based applications using **TDD** (Test Driven Development) technique to achieve the least issues possible. Feel free to copy, modify, and pull request this project since it's open source 👀

## Sections of content

- [Startup 📐](#startup)
- [Scripts 🚗](#scripts)
- [Architecture 🏗](#architecture)
  - [Components ⚡](#components)
  - [Contexts 📎](#contexts)
  - [Utilities 🔧](#utilities)
  - [Hooks ♻](#hooks)
  - [Tests 🧪](#tests)
  - [Stories 📖](#stories)
  - [Styles ✨](#styles)
  - [Localization 🎌](#localization)
  - [Types ⚙](#types)
  - [Mongodb models 🐾](#mongodb-models)
  - [Redux 🧰](#redux)
  - [Constants 📛](#constants)
  - [Controllers ⚙](#Controllers)
- [Environments 🌲](#environments)
- [Git 🦑](#git)
  - [Branching 🌿](#branching)
  - [Commits naming 💬](#commits-naming)
- [Development process 👨‍💻👩‍💻](#development-process)
  - [New functionality 🎉](#new-functionality)
  - [Bug fixes 🐜](#bug-fixes)

## Startup

To get started with the project:

1. Install Node.js if you haven't done it yet
2. Clone the source code via `git clone https://github.com/mrkelder/online-digital-shop.git`
3. Change your current directory to project's folder (type `cd message` in bash)
4. Install necessary dependencies via `npm i`
5. Create **.env.development** file and pass all the configuratino described [here](#environments). It's also encouraged to create **.env.production** as described in the link
6. Start up a local server by typing in `npm run dev`

You should be all good to go now. Simply open up [http://127.0.0.1:3000](http://127.0.0.1:3000). If you've received an error, there may be some things that you can troubleshoot

1. Ensure that all dependencies are installed. Run `npm i` if you don't see **node_modules** folder in project's directory. If you see this folder though, try `npm update` and then run `npm run dev` once again. If for some reason that doesn't help, try deleting both **node_modules** and **package-lock.json** then run `npm i`
2. Make sure that .env files have been created as the 5th step suggests
3. If none of the avobe has helped out, try reinstalling the whole project and following the steps once again
4. If even this doesn't help, please leave an issue [here](https://github.com/mrkelder/messenger/issues). Mark your issue with "bug" tag and describe your experience

## Scripts

To run a script use `npm run <script_name>` construction. Here's a list of all available scripts

- **dev** - starts a dev server
- **build** - bundles the application files and creates a production ready build
- **start** - starts the build version
- **lint** - checks for eslint errors and warnings
- **storybook** - opens us a storybook documentation page
- **build-storybook** - builds a storybook static documentation page
- **chromatic** - performs screenshot tests by sending screenshots to chromatic service
- **cypress:open** - calls up cypress testing environment window
- **test:all** - runs all the **test:\*** scripts listed below
- **test:utils** - runs all tests in **src/utils** directory
- **test:components** - runs all tests in **src/components** directory
- **test:controllers** - runs all tests in **\_\_test\_\_/controllers** directory

## Architecture

### Components

Components are stored in a **/src/components** folder. All components are written via **Containter-View** design pattern where possible. This pattern is supposed to be used in case we have both visual and computing logic in one component. Picture Button component for instance

```tsx
const Button: FC<Props> = ({ text, onClick }) => {
  return (
    <button className="bg-red" onClick={onClick}>
      {text}
    </button>
  );
};
```

In this particular case we **do not** need to use Container-View pattern since there's no computing logic inside of it. But what happens if we add a useState hook and a function to count how many times Button has been clicked for example?

```tsx
const Button: FC<Props> = ({ text, onClick }) => {
  const [timesClicked, setTimesClicked] = useState(0);

  function onClickHanlder() {
    setTimesClicked(prev => prev + 1);
    onClick();
  }

  return (
    <button className="bg-red" onClick={onClickHanlder}>
      {text}
    </button>
  );
};
```

In this situation we have to apply Container-View pattern to Button component

```tsx
// /src/components/Button/Container.tsx
import type { ContainerProps } from "./Button.d.ts";
import View from "./View";

const Container: FC<ContainerProps> = ({ text, onClick }) => {
  const [timesClicked, setTimesClicked] = useState(0);

  function onClickHanlder() {
    setTimesClicked(prev => prev + 1);
    onClick();
  }

  return <View onClick={onClickHanlder}>{text}</View>;
};

// /src/components/Button/View.tsx
import type { ViewProps } from "./Button.d.ts";

const View: FC<ViewProps> = ({ children, onClick }) => (
  <View className="bg-red" onClick={onClick}>
    {name}
  </View>
);
```

After we're done with the component, we can deal with exporting the it. Every component **has to** be exported via index.ts file in component's directory. In this case

```ts
// /src/components/Button/index.ts
export { default } from "./Container";
```

Keep in mind that all component related files have to live inside of component's folder (e.g. types, hooks, unit tests etc.)

### Contexts

Contexts are stored in **/src/contexts** folder. Here we store context files containing context, interfaces, and types

```ts
// /src/contexts/authContext.ts
import { createContext } from "react";
import type { AuthContext } from "./types";

interface AuthContext {
  changePage: () => void;
  // ...
}

const authContext = createContext<AuthContext | null>(null);

export default authContext;
```

### Utilities

Utility functions are located in **/src/utils/** directory. Generally, utilities are organized similarly to components: the source code, tests, types are stored in the corresponding folder

```ts
// /src/utils/Cookie/Cookie.ts
class Cookie implements GetValue, SetValue {
  private static set(key: string, value: string) {
    // ...
  }

  private static get(key: string) {
    // ...
  }
}

export default Cookie;

// /src/utils/Cookie/index.ts
export { default } from "./Cookie.ts";
```

### Hooks

The same story is applicable to hooks. They are stored in **/src/hooks/** folder. Unlike local hooks that are used within a parcticular component, /src/hooks/ folder consists of globally used hooks. The pattern of exporting hooks is identical to both components and utils

```tsx
// /src/hooks/useRandomNumber/useRandomNumber.ts
import { ReturnValue } from "./useRandomNumber.d.ts";

function useRandomNumber(): ReturnValue {
  return Math.random();
}

export default useRandomNumber;

// /src/hooks/useRandomNumber/index.ts
export { default } from "./useRandomNumber.ts";
```

### Tests

Basically, the majority of tests are stored within the tested modules (unit tests). However, screenshot, integrational, and E2E tests are stored in various places

- **Integrational** tests are stored in **/\_\_test\_\_/** folder in a root directory. These tests are meant to check whether different modules (e.g. pages, redux, components and others) can properly interact with each other. Also these tests are crucial for TDD
- **Screenshot** tests are implemented using storybook's plugin named **chromatic**. Storybooks are stored
- **E2E** tests are provided via Cypress library

To see tests application in action, please follow [this link](#Development) to the development section

### Stories

Storybook is used for screenshot testing as well as for the documentation purposes. Each story has to be located along with its component.

### Styles

This project is material-ui based, therefore raw css files aren't going to be used very often, although they are also applicable to MUI customization. Both css and MUI related configuration files are stored in **/styles/** folder. Yet rember that components' styles are stored in components' directories, **/styles/** is assumed to only contain global and page related styles

### Localization

Localization belongs in **/src/localization/**. This folder contains .json files with localization for each page. You can see an example below

```json
{
  "title": {
    "en": "Main page",
    "ua": "Головна сторінка",
    "es": "Pagina principal"
  }
}
```

Then these json files can be loaded and used for the localization intents

### Types

Types are generally stored in or along with the files they're used by, however global types can be found in **/src/types/**

### Mongodb models

Models are located in **/src/models/** directory. Don't forget to appopriately export models

```ts
export default mongoose.models[NAME] ||
  mongoose.model(NAME, characteristicSchema);
```

### Redux

Redux is located inside of **/src/store/** folder. In the root of this folder there's index.ts that exports store itself. Actions and reducers are stored in **/src/store/actions/** and **/src/store/reducers/** accordingly

### Constants

Constants are usually used across the whole project from components to redux actions. Thus they should be stored in catalogs rather than in a certain place. For instance, if a constant is a DOM event name and is more associated with components, then **CONSTANTS.ts** file has to belong to **/src/components/**. Same thing for redux contants as well as for mongoose ones and so on

### Controllers

Controllers are actual pieces of code that can be easily tested and integrated into a real code. Controllers' purpose is to handle business logic while omitting the implementation details. For instance, we could write an **authorization service** that saves the data to db and handles the token verification. Such code can be easily tested and integrated into the actual API endpoint. Controllers are stores inside of **src/controllers** folder

## Environments

Environment variables are stored in .env.development.local, .evn.production.local, and .env.test.local files at the root level. Data should be passed accroding to the current mode (either dev or production)

- ACCESS_TOKEN_SECRET - a secret combination of symbols for an access token (shouldn't be longer than 100 symbols)
- REFRESH_TOKEN_SECRET - a secret combination of symbols for a refresh token (shouldn't be longer than 100 symbols)
- MONGODB_HOST - a mongodb hostname e.g. **mongodb://127.0.0.1:27017/name**
- NEXT_PUBLIC_HOST - a hostname of the application for example **http://127.0.0.1**. Be careful to not add a trailing slash at the end of the url
<!-- TODO: - NEXT_PUBLIC_STATIC_HOST - a hostname of a satic server where all images are stored -->

Here's an example of both files

```
# .env.development.local

ACCESS_TOKEN_SECRET="access_secret"
REFRESH_TOKEN_SECRET="refresh_secret"
MONGODB_HOST="mongodb://127.0.0.1:27017/name"

NEXT_PUBLIC_HOST="http://127.0.0.1:3000"
```

```
# .env.test.local

ACCESS_TOKEN_SECRET="test"
REFRESH_TOKEN_SECRET="test"
MONGODB_HOST="mongodb://127.0.0.1:27017/name"

NEXT_PUBLIC_HOST="http://127.0.0.1:3000"
```

```
# .env.production.local

ACCESS_TOKEN_SECRET="j28dfboi8781so9wfinuxjw387c"
REFRESH_TOKEN_SECRET="jc71990djf91kkc82h1vienos"
MONGODB_HOST="mongodb://127.0.0.1:27017/name"

NEXT_PUBLIC_HOST="https://real.website.com"
```

## Git

While developing the application, developers have to strictly follow these git related rules

### Branching

This project uses so called **git flow** workflow. This workflow comes with the rules of branching. First of all, we have **main** branch that is **never** modified directly. To develop new features we create a new branch from main branch called **dev**

```bash
# While being on "main" branch
git checkout -b dev
```

This branch is used as a temporary "bridge" between new functonality and a production version and also is used to set up the initials. Whenver we want to develop a new feature though, we create **feat-\*** from dev branch

```bash
# While being on "dev" branch
git checkout -b feat-counter
```

After all the development process is finished, we merge our feature branch into dev

```bash
# While being on "feat-counter" branch
git checkout dev
git merge --no-ff feat-counter
```

Then we create **release-\*** branch from dev branch

```bash
git checkout -b release-1.1.0
```

Here we change package.json version, replenish docs if needed, and fix bugs. Make sure that \* symbol is substituted with a new version (e.g. release-1.1.0). After all changed have been saved, merge release branch to both **main and dev** branches and then push these brunches to GitHub

```bash
# Merging and pushing to "main" branch
git checkout main
git merge --no-ff release-1.1.0
git push -u origin main

# Same story for "dev" branch
git checkout dev
git merge --no-ff release-1.1.0
git push -u origin dev
```

If you want to fix an older problem, then you have to create **hotfix-\*** branch from main branch where \* is substituted with a new version as well

```bash
# While being on "main" branch
git checkout -b hotfix-1.1.1
```

After all the modifications merge hotfix branch to both **main and dev**, after that push both branches

```bash
# Merging and pushing to "main" branch
git checkout main
git merge --no-ff hotfix-1.1.1
git push -u origin main

# Same story for "dev" branch
git checkout dev
git merge --no-ff hotfix-1.1.1
git push -u origin dev
```

Follow the [link](#development-process) to see these principles in action

### Commits naming

Every commit has to start with one of these prefixes

- feat: - a new functionality in either existing or new files
- fix: - either bug fixes or a new implementation of the old logic
- dev: - a new dependency is added, a new workflow is applied, the version has changed etc.
- docs: - documentation modifications (**storybook stories** fall into documentation category as well)
- test: - basically any kind of tests (pay attention that **storybook stories aren't particularly tests** even though they're used to provide screenshot testing)

```bash
git commit -m "feat: added a counter to Button components"
```

## Development process

The development process is generally devided into to activities: adding new functionality or patching the old logic

### New functionality

To start creating new functinality, we first have to create a **feat-\*** branch as shown in [branching](#branching) section. Say, we need to develop a custom input comoponent. First, we start off with writing unit tests to our code

```tsx
describe("Input", () => {
  test('Should render with "Hello World" placeholder', () => {
    // ...
  });

  // other crucial tests
});
```

During this process we can better understand how the component is going to behave. Once unit tests are completed, we can get on with the integrational test After we've covered all the critical functionality via unit tests, we can begin writing the implementation of our tests. The notion of this kind of tests is to verify that modules work well together, not only in an isolation. These kind of modules may include testing redux and the component or page and the component etc.

```tsx
import { render, screen } from "@testing-library/react";
import Index from "pages/index";

describe("Index page", () => {
  test('Should render Input with "Hello World" placeholder', () => {
    render(<Index />);

    expect(screen.getByPlaceholderText(/Hello World/i)).toBeInTheDocument();
  });

  // ...
});
```

After all the thorough work on tests, we can finally proceed with the component itself

```tsx
// /src/components/Input/Input.tsx
const Input: FC<Props> = ({ placeholder }) => (
  <input placeholder={placeholder} />
);

export default Input;

// /src/components/Input/index.ts
export { default } from "./Input";
```

The final stesps include writing or updating existing E2E tests. Then we merge our **feature** branch into **dev** branch and after that create a **release-\*** branch from dev. Here we have to update our stories and make screenshots as well as bump the version in package.json file. **Caution!** Whenever we develop a new feature, we increment **MAJOR** version like so `x.1.x -> x.2.x`. When job is done, we can merge the release into both **main and dev** branches and push the changes. Now, all we need to do is to go to repository's [realeases section](https://github.com/mrkelder/messenger/releases) and draft a new release. That's it 🎉🎉🎉

### Bug fixes

In case we need to patch some improperly working logic, we create a **hotfix-\*** branch from **main** branch. Now we can start getting shot of the problem. It's worth to notice that there two types of problem:

1. Code appearance - there will be no functionality changes
2. Code logic - there will be minor or significant functionality changes

The first type allows us to just modify code to make it, for instance, look better, then bump **PATCH** version `x.x.1 -> x.x.2`, and finally merge the hotfix branch into both **main and dev** branches. Nevertheless, the second type involves tests modifications. First we change our old unit (and integrational tests if needed) to fulfill new requirements after which we can start solving the problem. Then we make new E2E and screenshot test, bump the version, and merge the branches as it was mentioned before. There you go, the project has just become better 🤩
