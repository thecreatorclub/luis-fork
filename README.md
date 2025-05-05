This is change 1.
'Four key traits for any coding project
A Readme.md, when written correctly, is an essential tool for any coding project you are in, regardless of whether it is written in a personal or professional space. Readme.md is a great tool, and when done well, it can reduce complexity in setting up the local development environment. Its locality to the project code is a bonus to its accessibility to all working on the codebase.

However, I came across people whose experiences with Readme.md differs from mine. Many negative experiences include Readme.md being too much effort to maintain, containing outdated information, being too wordy or just simply there is no benefit in needing to write one.

So, what are the traits of a good Readme.md?

1. Information laid out in sections
Headings serve its function to help section out information in a digestible way. Readme.md is a document that could be referred to by users of the codebase at any stage of the project, so it will be of great help if the information is laid out in a way where a user could just easily skim for the section they need.

Here is an example of a layout sectioned by headings.

# Project Name
## Prerequisite
## Install dependencies
## Build project
## Run test
The table of contents is excluded in the example above as I consider it optional. However, if a Readme.md contains a lot of headings and information, I will say go for it.

2. Clear and concise
Provide just enough information for users to quickly self-guide themselves to setup and use and avoid padding with unnecessary information. Strive for simplicity as it not only reduces the cognitive load but can lead to lower maintainability. Usage of markdown syntax like code blocks, bullet points, table are highly encouraged.

An example of a detailed manual instructions:

To install the required binary:

1. Go to the Example website [here](https://example.com/) and click on the "Download" button in the navigation bar.
2. Find in the Download page "example_latest_linux_amd64.tar.gz" and click to download
3. In the file dialog box, navigate to `/usr/local/bin` and click Download
4. Go to the `/usr/local/bin/` directory in the file explorer and extract the binary
5. Run the binary
I made good use of numbered bullet points to present information in steps. In many cases, there are alternate ways to get the same outcome as the steps above in a more pleasing way to read and follow. The following is an easier-to-follow alternative:

Copy and paste the following code block into your terminal and press Enter:

```shell
wget https://www.example.com/releases/download/latest/example_latest_linux_amd64.tar.gz
tar -xzvf example_latest_linux_amd64.tar.gz
mv example /usr/local/bin/
chmod u+x /usr/local/bin/example
example --version
```
It is even better if you already utilise the Makefile (or scripts). It’s just a one-line terminal command, but I will be happy with the code block above. Many of my Readme.md refers to the Makefile or scripts as it helps reduce the complexity of doing ordinary dev things like installing or running a project. Here is an example of the Install section of many projects I’ve been involved in:

## Install project

```shell
make install
```
And guess what the build is? It’s just a one-line terminal command in code block markdown syntax.

## Build project

```shell
make build
```
3. Provide just enough information
This sounds easy, but it also requires some thought and putting yourself in your typical user’s shoes. Are you writing a Readme.md for an open-source project? Then, include the Licence and Contributors section. Is it a binary application that utilises command-line flags? Then, include at least the commonly used command-line flags. Is it a style guide used for UI components? Link to the style guide.

In some projects I worked with, there is a section of the Readme.md dedicated to issues encountered. An issue worth documenting is when a project is negatively affected by a dependency (dependencies hell), which will restrict the development team from doing a particular thing.

If a Readme.md contains too much information, break it into separate files! Common categories to break out include:

log type information such as the Architecture Decision Record (ADR) and Change Logs
design specs such as a database table structure
guides such as how to contribute to the project
conventions such as coding-related conventions (naming conventions, commit messages conventions)
4. Avoid dated information
Readme.md often needs to be addressed after it is written. From time to time, a newcomer to the project could discover something to update and proactively do so. To make it more maintainable, ensure the information written on the Readme.md does not go stale. These could include giving instructions that are tightly coupled to an external entity that is prone to changes, such as a specific location of a button on a webpage or a URL to a webpage where the URL changes often.

Hopefully, these tips above will help you somewhat. Remember, if it is done correctly, it is a write-and-sort-of-forget kind of thing.

