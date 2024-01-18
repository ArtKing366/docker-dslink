import {DSLink, RootNode, SimpleNode} from 'dslink-ts/dist/index';
import Docker from 'dockerode';

class DockerContainerNode extends SimpleNode {
  serializable: boolean;
  configs: { $$name: any; $$type: string; $$value: any; };
  constructor(containerInfo: { Id: any; Names: any[]; Status: any; }) {
    super(containerInfo.Id);
    this.serializable = true;
    this.configs = {
      $$name: containerInfo.Names[0],
      $$type: "dynamic",
      $$value: containerInfo.Status
    };
  }
}

class DockerImageNode extends SimpleNode {
  constructor(imageInfo: any) {
    super(imageInfo.Id);
    this.serializable = true;
    this.configs = {
      $$name: imageInfo.RepoTags[0],
      $$type: "dynamic",
      $$value: imageInfo.Id
    };
  }
}

class DockerNetworkNode extends SimpleNode {
  serializable: boolean;
  configs: { $$name: any; $$type: string; $$value: any; };
  constructor(networkInfo: { Id: any; Name: any; }) {
    super(networkInfo.Id);
    this.serializable = true;
    this.configs = {
      $$name: networkInfo.Name,
      $$type: "dynamic",
      $$value: networkInfo.Id
    };
  }
}

async function startContainer(containerId: string) {
  let docker = new Docker();
  let container = docker.getContainer(containerId);
  await container.start();
}

async function main() {
  let rootNode = new RootNode();
  let link = new DSLink('docker', {rootNode});

  let docker = new Docker();
  let containers = await docker.listContainers();
  let images = await docker.listImages();
  let networks = await docker.listNetworks();

  for (let containerInfo of containers) {
    let node = new DockerContainerNode(containerInfo);
    rootNode.addChild(node);
  }

  for (let imageInfo of images) {
    let node = new DockerImageNode(imageInfo);
    rootNode.addChild(node);
  }

  for (let networkInfo of networks) {
    let node = new DockerNetworkNode(networkInfo);
    rootNode.addChild(node);
  }
  if (containers.length > 0) {
    await startContainer(containers[0].Id);
  }

  await link.connect();
}

main().catch(console.error);

