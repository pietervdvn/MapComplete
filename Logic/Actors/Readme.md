<!--
SPDX-FileCopyrightText: 2023 MapComplete  <https://mapcomplete.osm.be/>

SPDX-License-Identifier: GPL-3.0-ONLY
-->

Actors
======

An **actor** is a module which converts one UIEventSource into another while performing logic.

Typically, it will only expose the constructor taking some UIEventSources (and configuration) and a few fields which are
UIEVentSources.

An actor should _never_ have a dependency on 'State' and should _never_ import it