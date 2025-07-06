import { PackageBase } from './package-base';
import { Draft } from './draft';
import { Package } from './package';

async function pack(dr: Draft): Promise<Package> {
    return await Package.create(dr.getName(), dr.getDirectDeps(), dr.getSrcDir(), dr.getAgdaFiles(), dr.getMdFiles());
}

async function unpack(pkg: Package, dest: string): Promise<Draft> {
    return await Draft.create(dest, pkg.getName(), pkg.getDirectDeps(), pkg.getPayload());
}

export { PackageBase, Draft, Package, pack, unpack };
