# Overview
We are using typedoc and mkdocs to generate documentation.

Mkdocs is used to generate documentation that is shown on ReadTheDocs - http://docs.bespoken.tools.

**Please note - do not change the docs/index.md file directly**   
It will be generated/copied from the README.md using the **docs** gulp task:
```
gulp docs
```

## Viewing on ReadTheDocs
First request access to the ReadTheDocs - sign up for an account and send the username to JPK.  

Once you have been added, you can go to:
https://readthedocs.org/dashboard/bst/edit/

If your branch has been pushed remotely just set it "Active" and it will become visible on ReadTheDocs as a preview.

# Local development
## Building

Make sure you have mkdocs installed

```bash
$ pip install mkdocs
```

Then, from root project root directory, build HTML:

```bash
$ mkdocs build
```

## Writing

When writing the docs, it is often helpful to autogen the HTML after every change:

```
$ mkdocs serve --livereload
```

If things are not updating and you think something isn't right, clean the docs:
```bash
$ mkdocs build -c
```

# Overriding Styles

If you want to override the style on an element, use the [attr_list](https://pythonhosted.org/Markdown/extensions/attr_list.html) markdown feature.  With attr_list you can add classes to elements and then create the class in `/docs/assets/css/style.css`.

For example, in the `docs/index.md` file, the class `.badge` is added to the image badges:

```
[![Build Status](https://travis-ci.org/bespoken/bst.svg?branch=master){: class="badge" }](https://travis-ci.org/bespoken/bst)
```

and the style is declared as:

```
img.badge {
    width: auto;
}
```

which prevents full width badge images on mobile.
