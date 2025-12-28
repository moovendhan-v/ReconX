FROM kalilinux/kali-rolling:latest

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Update and upgrade system
RUN apt-get update && apt-get upgrade -y

# Install essential tools and dependencies
RUN apt-get install -y \
    apt-utils \
    software-properties-common \
    build-essential \
    git \
    wget \
    curl \
    vim \
    nano \
    net-tools \
    iputils-ping \
    dnsutils \
    python3 \
    python3-pip \
    python3-dev \
    python2 \
    ruby \
    ruby-dev \
    perl \
    php \
    golang \
    default-jdk \
    openjdk-11-jdk \
    ca-certificates \
    gnupg \
    lsb-release

# Install Kali Linux metapackages for pentesting
RUN apt-get install -y \
    kali-tools-information-gathering \
    kali-tools-vulnerability \
    kali-tools-web \
    kali-tools-passwords \
    kali-tools-wireless \
    kali-tools-reverse-engineering \
    kali-tools-exploitation \
    kali-tools-social-engineering \
    kali-tools-sniffing-spoofing \
    kali-tools-post-exploitation

# Install popular pentesting tools individually
RUN apt-get install -y \
    nmap \
    masscan \
    nikto \
    sqlmap \
    metasploit-framework \
    burpsuite \
    wireshark \
    tcpdump \
    aircrack-ng \
    hydra \
    john \
    hashcat \
    wordlists \
    dirb \
    dirbuster \
    gobuster \
    wfuzz \
    ffuf \
    zaproxy \
    netcat-traditional \
    socat \
    netcat-openbsd \
    smbclient \
    enum4linux \
    nbtscan \
    onesixtyone \
    ldap-utils \
    snmp \
    redis-tools \
    postgresql \
    mysql-client \
    whois \
    wafw00f \
    wpscan \
    joomscan \
    theharvester \
    recon-ng \
    maltego \
    amass \
    sublist3r \
    subfinder \
    assetfinder \
    httprobe \
    nuclei \
    waybackurls \
    gau \
    whatweb \
    dmitry \
    fierce \
    dnsenum \
    dnsrecon \
    sslscan \
    sslyze \
    testssl.sh \
    crackmapexec \
    evil-winrm \
    responder \
    impacket-scripts \
    bloodhound \
    neo4j \
    exploitdb \
    searchsploit \
    mimikatz \
    powershell-empire \
    set \
    beef-xss \
    bettercap \
    ettercap-common \
    mitmproxy \
    proxychains4 \
    tor \
    openssh-server \
    openssh-client \
    sshpass \
    nfs-common \
    cifs-utils \
    rdesktop \
    freerdp2-x11 \
    rlwrap \
    gdb \
    gdbserver \
    radare2 \
    binwalk \
    foremost \
    volatility3 \
    yara \
    chkrootkit \
    rkhunter \
    lynis \
    cewl \
    crunch \
    rsmangler

# Install additional Python tools
RUN pip3 install --no-cache-dir \
    impacket \
    crackmapexec \
    bloodhound \
    mitm6 \
    scapy \
    requests \
    beautifulsoup4 \
    paramiko \
    pwntools \
    ropper \
    capstone \
    keystone-engine \
    unicorn \
    angr \
    pycryptodome \
    pyftpdlib \
    dnspython \
    python-nmap

# Install Go-based tools
ENV GOPATH=/root/go
ENV PATH=$PATH:$GOPATH/bin

RUN go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest && \
    go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest && \
    go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest && \
    go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest && \
    go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest && \
    go install -v github.com/tomnomnom/waybackurls@latest && \
    go install -v github.com/tomnomnom/gf@latest && \
    go install -v github.com/tomnomnom/httprobe@latest && \
    go install -v github.com/tomnomnom/assetfinder@latest && \
    go install -v github.com/ffuf/ffuf@latest && \
    go install -v github.com/OJ/gobuster/v3@latest

# Install wordlists
RUN apt-get install -y seclists && \
    gunzip /usr/share/wordlists/rockyou.txt.gz 2>/dev/null || true

# Create working directories
RUN mkdir -p /root/tools /root/wordlists /root/output /root/scripts

# Set working directory
WORKDIR /root

# Configure metasploit database
RUN service postgresql start && \
    msfdb init || true

# Expose common ports for services
EXPOSE 22 80 443 4444 8080 8443

# Set default shell
SHELL ["/bin/bash", "-c"]

# Keep container running
CMD ["/bin/bash"]