# Stage 1
FROM nvcr.io/nvidia/cuda:12.9.1-base-ubi9 AS build
SHELL ["/bin/bash", "-c"]

RUN dnf install -y git wget

# Stage 2
FROM quay.io/centos/centos:9

LABEL org.opencontainers.image.source https://github.com/TampaDevs/cloud-development-gitops-infra
ENV TARGETARCH=x86_64

ARG BASE_URL=https://us.download.nvidia.com/XFree86/Linux-x86_64
ENV BASE_URL=${BASE_URL}

ARG DRIVER_TYPE=baremetal
ENV DRIVER_TYPE=$DRIVER_TYPE

ARG DRIVER_VERSION="570.169"
ENV DRIVER_VERSION=$DRIVER_VERSION

ARG DRIVER_TOOLKIT_IMAGE
ENV DRIVER_TOOLKIT_IMAGE=$DRIVER_TOOLKIT_IMAGE

ENV NVIDIA_VISIBLE_DEVICES=void

ENV PATH="$PATH:/user/local/bin"

SHELL ["/bin/bash", "-c"]

RUN dnf makecache 
RUN dnf install -y kmod util-linux 'dnf-command(download)' 
RUN dnf install -y patch
ADD install.sh /tmp/

RUN NVIDIA_GPGKEY_SUM=d0664fbbdb8c32356d45de36c5984617217b2d0bef41b93ccecd326ba3b80c87 && \
    curl -# -v "https://developer.download.nvidia.com/compute/cuda/repos/rhel8/x86_64/D42D0685.pub" | sed '/^Version/d' > /etc/pki/rpm-gpg/RPM-GPG-KEY-NVIDIA && \
    echo "$NVIDIA_GPGKEY_SUM  /etc/pki/rpm-gpg/RPM-GPG-KEY-NVIDIA" | sha256sum -c --strict -

RUN /bin/bash -x /tmp/install.sh depinstall && \
    curl -# -v -o /usr/local/bin/extract-vmlinux \
    https://raw.githubusercontent.com/torvalds/linux/master/scripts/extract-vmlinux && \
    chmod +x /usr/local/bin/extract-vmlinux && \
    ln -s /sbin/ldconfig /sbin/ldconfig.real

ADD drivers drivers/
WORKDIR /drivers

ENV DRIVER_ARCH=${TARGETARCH}
RUN curl -# -vv --output-dir /drivers/ \
    -O $BASE_URL/$DRIVER_VERSION/NVIDIA-Linux-$DRIVER_ARCH-$DRIVER_VERSION.run 
RUN chmod +x /drivers/NVIDIA-Linux-$DRIVER_ARCH-$DRIVER_VERSION.run

COPY --chmod=755 nvidia-driver /usr/local/bin

LABEL io.k8s.display-name="NVIDIA Driver Container"
LABEL name="NVIDIA Driver Container"
LABEL summary="Provision the NVIDIA driver through containers"
LABEL vendor="NVIDIA"
LABEL version="${DRIVER_VERSION}"
LABEL release="N/A"
LABEL description="See summary"

RUN rm -f /etc/yum.repos.d/cuda.repo

ENTRYPOINT ["nvidia-driver", "init"]
