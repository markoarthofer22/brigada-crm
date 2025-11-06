#!/bin/bash

# MORA SE OVO DODATI AKO NE RADI GIT PUSH LIVE MAIN
# git remote add live ssh://root@213.136.84.150/var/www/subdomains/brigada.nacverto.hr/repo.git


# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No color

echo -e "${YELLOW}Adding all changes...${NC}"
git add -A
if [ $? -ne 0 ]; then
  echo -e "${RED}[ERROR] Failed to add changes.${NC}"
  exit 1
fi

echo -e "${YELLOW}Enter commit message:${NC} "
read -r MSG

echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "$MSG"
if [ $? -ne 0 ]; then
  echo -e "${RED}[ERROR] Commit failed (maybe nothing to commit).${NC}"
  exit 1
fi

echo -e "${YELLOW}Pushing to origin...${NC}"
git push
if [ $? -ne 0 ]; then
  echo -e "${RED}[ERROR] Push to origin failed.${NC}"
  exit 1
fi

echo -e "${YELLOW}Pushing to 'test' remote (main branch)...${NC}"
git push test main
if [ $? -ne 0 ]; then
  echo -e "${RED}[ERROR] Push to test failed.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ All done! Code pushed successfully.${NC}"
