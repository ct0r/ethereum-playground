FROM fedora:35

ARG IMAGE_USER=vscode
ARG IMAGE_NODE_VERSION=--lts

RUN dnf upgrade -y \
    && dnf install -y findutils nano git zsh curl \
    && useradd -G wheel -s /usr/bin/zsh $IMAGE_USER \
    && sed -e 's/^%wheel/#%wheel/g' -e 's/^# %wheel/%wheel/g' -i /etc/sudoers

USER $IMAGE_USER

# Tools
RUN curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh | sh

# Nodej.js
RUN curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | sh \
    && . $HOME/.nvm/nvm.sh \
    && nvm install --no-progress $IMAGE_NODE_VERSION \
    && sed -e "s/^plugins=(/plugins=(npm /g" -i $HOME/.zshrc
