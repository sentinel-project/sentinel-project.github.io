# Makefile
GITHUB_REPO ?= sentinel-project/sentinel-project.github.io

dist: clean
	npm run build

# Sends the documentation to gh-pages.
deploy: dist
	cd dist && \
	git init . && \
	git add . && \
	git commit -m "Update documentation."; \
	git push "git@github.com:$(GITHUB_REPO).git" master:master --force && \
	rm -rf .git

clean:
	rm -rf dist

.PHONY: deploy clean
