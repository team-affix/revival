# Use the Red Hat Universal Base Image (UBI 8)
FROM registry.access.redhat.com/ubi8/ubi

# (Optional) Update packages and install bash (if not already present)
RUN yum update -y && \
    yum install -y bash

# Set the default command to launch an interactive bash shell
CMD ["/bin/bash"]
