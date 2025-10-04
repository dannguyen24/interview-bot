{ pkgs, ... }:
pkgs.mkShell {
  packages = [ pkgs.nodejs-18_x ];
}
