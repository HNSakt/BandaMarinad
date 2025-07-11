import { type BooleanLike, classes } from 'common/react';
import { createSearch } from 'common/string';
import { Fragment, useState } from 'react';
import { useBackend } from 'tgui/backend';
import {
  Button,
  Collapsible,
  Divider,
  Flex,
  Icon,
  Image,
  Input,
  NumberInput,
  Table,
} from 'tgui/components';
import { Window } from 'tgui/layouts';

import { CastesRu } from './BandaMarines/XenoCastes';

const redFont = {
  color: 'red',
};

const grayFont = {
  color: 'gray',
};

/**
 * Filters the list of xenos and returns a set of rows that will be used in the
 * xeno list table
 */
const filterXenos = (data: {
  searchKey: string;
  searchFilters: { name: boolean; strain: boolean; location: boolean };
  maxHealth: number;
  xeno_keys: XenoKey[];
  xeno_vitals: XenoVitals[];
  xeno_info: XenoInfo[];
}) => {
  const {
    searchKey,
    searchFilters,
    maxHealth,
    xeno_keys,
    xeno_vitals,
    xeno_info,
  } = data;
  const xeno_entries: XenoEntry[] = [];

  xeno_keys.map((key, i) => {
    const nicknumber = key.nicknumber.toString();
    let entry = {
      nicknumber: nicknumber,
      name: xeno_info[nicknumber].name,
      strain: xeno_info[nicknumber].strain,
      location: xeno_vitals[nicknumber].area,
      health: xeno_vitals[nicknumber].health,
      plasma: xeno_vitals[nicknumber].plasma,
      ref: xeno_info[nicknumber].ref,
      is_ssd: xeno_vitals[nicknumber].is_ssd,
      is_leader: key.is_leader,
      is_queen: key.is_queen,
    };
    xeno_entries.push(entry);
  });

  const filter_params = {
    searchKey: searchKey,
    searchFilters: searchFilters,
    maxHealth: maxHealth,
  };
  const filtered = xeno_entries.filter(getFilter(filter_params));

  return filtered;
};

/**
 * Creates a filter function based on the search key (passed to the search bar),
 * the categories selected to be searched through, and the max health filter
 */
const getFilter = (data) => {
  const { searchKey, searchFilters, maxHealth } = data;
  const textSearch = createSearch(searchKey);

  return (entry) => {
    if (entry.health > maxHealth) {
      return false;
    }

    let hasFilter = false;
    for (let filter in searchFilters) {
      if (searchFilters[filter]) {
        hasFilter = true;
        if (textSearch(entry[filter])) {
          return true;
        }
      }
    }

    return hasFilter ? false : true;
  };
};

type XenoEntry = {
  nicknumber: string;
  name: string;
  strain: string;
  location: string | null;
  health: number;
  plasma: number;
  ref: string;
  is_ssd: BooleanLike;
  is_leader: BooleanLike;
  is_queen: BooleanLike;
};

type XenoKey = {
  nicknumber: number;
  tier: string;
  is_leader: BooleanLike;
  is_queen: BooleanLike;
  caste_type: string;
};

type TierSlot = { open_slots: string; guaranteed_slots: string };
type XenoInfo = { name: string; straing: string; ref: string };
type XenoVitals = {
  health: number;
  plasma: number;
  area: string;
  is_ssd: BooleanLike;
};

type Data = {
  total_xenos: number;
  xeno_icons: Record<string, string>[];
  xeno_counts: Record<string, number>[];
  tier_slots: { 3: TierSlot; 2: TierSlot };
  xeno_keys: XenoKey[];
  xeno_info: XenoInfo[];
  xeno_vitals: XenoVitals[];
  queen_location: string | null;
  hive_location: string | null;
  burrowed_larva: number;
  evilution_level: number;
  pylon_status: string;
  xeno_background: string;
  is_in_ovi: BooleanLike;
  user_ref: string;
  hive_color: string;
  hive_name: string;
};

export const HiveStatus = (props) => {
  const { data } = useBackend<Data>();
  const { hive_name } = data;

  return (
    <Window
      title={'Статус ' + hive_name}
      theme="hive_status"
      width={600}
      height={680}
    >
      <Window.Content scrollable>
        <XenoCollapsible title="Общая информация об улье">
          <GeneralInformation />
        </XenoCollapsible>
        <Divider />
        <XenoCollapsible title="Численность улья">
          <XenoCounts />
        </XenoCollapsible>
        <Divider />
        <XenoCollapsible title="Список ксеноморфов улья">
          <XenoList />
        </XenoCollapsible>
      </Window.Content>
    </Window>
  );
};

const GeneralInformation = (props) => {
  const { data } = useBackend<Data>();
  const {
    queen_location,
    hive_location,
    total_xenos,
    burrowed_larva,
    evilution_level,
    pylon_status,
  } = data;

  return (
    <Flex direction="column" align="center">
      {queen_location === null ? (
        <Flex.Item textAlign="center">
          <h3 className="whiteTitle">Улей не имеет Королевы!</h3>
        </Flex.Item>
      ) : (
        <Flex.Item textAlign="center">
          <h3 className="whiteTitle">Королева находится в:</h3>
          <h1 className="whiteTitle">{queen_location}</h1>
        </Flex.Item>
      )}
      {!!hive_location && (
        <Flex.Item textAlign="center" mt={2}>
          <h3 className="whiteTitle">Местоположения улья:</h3>
          <h1 className="whiteTitle">{hive_location}</h1>
        </Flex.Item>
      )}
      <Flex.Item mt={1}>
        <i>Всего сестёр: {total_xenos}</i>
      </Flex.Item>
      <Flex.Item>
        <i>Зарытые грудоломы: {burrowed_larva}</i>
      </Flex.Item>
      <Flex.Item>
        <i>Evilution: {evilution_level}</i>
      </Flex.Item>
      {pylon_status && (
        <Flex.Item>
          <i>{pylon_status}</i>
        </Flex.Item>
      )}
    </Flex>
  );
};

const XenoCounts = (props) => {
  const { data } = useBackend<Data>();
  const { xeno_background, xeno_icons, xeno_counts, tier_slots, hive_color } =
    data;

  return (
    <Flex direction="column-reverse">
      {xeno_counts.map((counts, tier) => {
        let tier_str = tier.toString();
        let guaranteed_slots;
        // Check if there are guaranteed slots available for a given tier
        if (tier_slots[tier_str]) {
          guaranteed_slots = Object.keys(tier_slots[tier_str].guaranteed_slots);
          if (guaranteed_slots.length === 0) {
            guaranteed_slots = null;
          }
        }
        return (
          <Flex.Item key={tier} mb={tier !== 0 ? 2 : 0}>
            <Flex direction="column">
              <Flex.Item>
                <center>
                  <h1 className="whiteTitle">Уровень {tier}</h1>
                  {tier >= 2 && (
                    <i>
                      <div>
                        <span
                          style={{
                            marginRight: '4px',
                          }}
                        >
                          {tier_slots[tier_str].open_slots}
                        </span>
                        мест осталось
                      </div>
                      {guaranteed_slots && (
                        <div>
                          Гарантированные места:{' '}
                          {guaranteed_slots.map((caste_type, i) => (
                            <Fragment key={i}>
                              <span
                                style={{
                                  marginRight: '4px',
                                }}
                              >
                                {
                                  tier_slots[tier_str].guaranteed_slots[
                                    caste_type
                                  ]
                                }
                              </span>
                              {CastesRu(caste_type)}
                              {/* No comma at the end of the list*/}
                              {i === guaranteed_slots.length - 1 ? '' : ', '}
                            </Fragment>
                          ))}
                        </div>
                      )}
                    </i>
                  )}
                </center>
              </Flex.Item>
              <Flex.Item>
                <center>
                  <Table className="xenoCountTable" collapsing>
                    <Table.Row header style={{ transform: 'translateX(10px)' }}>
                      {Object.keys(counts).map((caste, i) => (
                        <Table.Cell
                          key={i}
                          className="underlineCell"
                          width={caste.length}
                          nowrap
                        >
                          <Image
                            src={`data:image/jpeg;base64,${xeno_background}`}
                            position="absolute"
                            style={{
                              transform:
                                'scale(3) translateX(-6px) translateY(1px)',
                            }}
                          />
                          <Image
                            src={`data:image/jpeg;base64,${xeno_icons[tier][caste]}`}
                            position="absolute"
                            style={{
                              transform:
                                'scale(3) translateX(-6px) translateY(1px)',
                            }}
                          />
                          {caste === 'Bloody Larva'
                            ? CastesRu('Larva')
                            : CastesRu(caste)}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                    <Table.Row className="xenoCountRow">
                      {Object.keys(counts).map((caste, i) => (
                        <Table.Cell
                          key={i}
                          className="xenoCountCell"
                          backgroundColor={!!hive_color && hive_color}
                          textAlign="center"
                          width={7}
                        >
                          {counts[caste]}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  </Table>
                </center>
              </Flex.Item>
            </Flex>
          </Flex.Item>
        );
      })}
    </Flex>
  );
};

const XenoList = (props) => {
  const { act, data } = useBackend<Data>();
  const [searchKey, setSearchKey] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    name: true,
    strain: true,
    location: true,
  });
  const [maxHealth, setMaxHealth] = useState(100);
  const { xeno_keys, xeno_vitals, xeno_info, user_ref, is_in_ovi, hive_color } =
    data;
  const [showPlasma, setShowPlasma] = useState(is_in_ovi ? true : false);

  const xeno_entries = filterXenos({
    searchKey: searchKey,
    searchFilters: searchFilters,
    maxHealth: maxHealth,
    xeno_keys: xeno_keys,
    xeno_vitals: xeno_vitals,
    xeno_info: xeno_info,
  });

  return (
    <Flex direction="column">
      <Flex.Item mb={1}>
        <Flex align="baseline">
          <Flex.Item width="100px">Фильтры поиска:</Flex.Item>
          <Flex.Item>
            <Button.Checkbox
              inline
              checked={searchFilters.name}
              backgroundColor={searchFilters.name && hive_color}
              onClick={() =>
                setSearchFilters({
                  ...searchFilters,
                  name: !searchFilters.name,
                })
              }
            >
              Имя
            </Button.Checkbox>
            <Button.Checkbox
              inline
              checked={searchFilters.strain}
              backgroundColor={searchFilters.strain && hive_color}
              onClick={() =>
                setSearchFilters({
                  ...searchFilters,
                  strain: !searchFilters.strain,
                })
              }
            >
              Подвид
            </Button.Checkbox>
            <Button.Checkbox
              inline
              checked={searchFilters.location}
              backgroundColor={searchFilters.location && hive_color}
              onClick={() =>
                setSearchFilters({
                  ...searchFilters,
                  location: !searchFilters.location,
                })
              }
            >
              Местоположение
            </Button.Checkbox>
          </Flex.Item>
        </Flex>
      </Flex.Item>
      <Flex.Item mb={1}>
        <Flex align="baseline">
          <Flex.Item>
            <Button.Checkbox
              inline
              checked={showPlasma}
              backgroundColor={showPlasma && hive_color}
              onClick={() => setShowPlasma(!showPlasma)}
            >
              Показывать плазму
            </Button.Checkbox>
          </Flex.Item>
        </Flex>
      </Flex.Item>
      <Flex.Item mb={1}>
        <Flex align="baseline">
          <Flex.Item>
            <Button.Checkbox
              inline
              checked={showPlasma}
              backgroundColor={showPlasma && hive_color}
              onClick={() => setShowPlasma(!showPlasma)}
            >
              Show Plasma
            </Button.Checkbox>
          </Flex.Item>
        </Flex>
      </Flex.Item>
      <Flex.Item mb={1}>
        <Flex align="baseline">
          <Flex.Item width="100px">Максимальное здоровье:</Flex.Item>
          <Flex.Item>
            <NumberInput
              animated
              width="40px"
              step={1}
              stepPixelSize={5}
              value={maxHealth}
              minValue={0}
              maxValue={100}
              onChange={(value) => setMaxHealth(value)}
            />
          </Flex.Item>
        </Flex>
      </Flex.Item>
      <Flex.Item mb={2}>
        <Input
          fluid
          placeholder="Поиск..."
          onInput={(_, value) => setSearchKey(value)}
        />
      </Flex.Item>

      <Table className="xeno_list">
        <Table.Row header className="xenoListRow">
          <Table.Cell width="5%" className="noPadCell" />
          <Table.Cell>Имя</Table.Cell>
          <Table.Cell width="15%">Подвид</Table.Cell>
          <Table.Cell>Местоположение</Table.Cell>
          <Table.Cell width="60px">Здоровье</Table.Cell>
          {showPlasma && <Table.Cell width="60px">Плазма</Table.Cell>}
          <Table.Cell width="100px" />
        </Table.Row>

        {xeno_entries.map((entry, i) => (
          <Table.Row
            key={i}
            className={classes([entry.is_ssd ? 'ssdRow' : '', 'xenoListRow'])}
          >
            {/*
              Leader/SSD icon
              You might think using an image for rounded corners is stupid,
              but I shit you not, BYOND's version of IE doesn't support
              border-radius
            */}
            <Table.Cell className="noPadCell">
              <StatusIcon entry={entry} />
            </Table.Cell>
            <Table.Cell>{entry.name}</Table.Cell>
            <Table.Cell>{entry.strain}</Table.Cell>
            <Table.Cell>{entry.location}</Table.Cell>
            <Table.Cell>
              {entry.health < 30 ? (
                <b style={redFont}>{entry.health}%</b>
              ) : (
                <>{entry.health}%</>
              )}
            </Table.Cell>
            {showPlasma && (
              <Table.Cell>
                {entry.plasma < 0 ? (
                  <div style={grayFont}>------</div>
                ) : entry.plasma < 30 ? (
                  <b style={redFont}>{entry.plasma}%</b>
                ) : (
                  <>{entry.plasma}%</>
                )}
              </Table.Cell>
            )}
            <Table.Cell className="noPadCell" textAlign="center">
              {entry.ref !== user_ref && (
                <Flex
                  unselectable="on"
                  wrap="wrap"
                  className="actionButton"
                  align="center"
                  justify="space-around"
                  inline
                >
                  <Flex.Item>
                    <Button
                      color="xeno"
                      onClick={() =>
                        act('overwatch', {
                          target_ref: entry.ref,
                        })
                      }
                    >
                      Смотреть
                    </Button>
                  </Flex.Item>
                  {!!is_in_ovi && <QueenOviButtons target_ref={entry.ref} />}
                </Flex>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </Flex>
  );
};

const StatusIcon = (props: { readonly entry: XenoEntry }) => {
  const { entry } = props;
  const { is_ssd, is_leader, is_queen } = entry;

  if (is_ssd) {
    return <div unselectable="on" className="ssdIcon" />;
  } else if (is_leader || is_queen) {
    return (
      <div unselectable="on" className="leaderIcon">
        <Icon name="star" ml={0.2} />
      </div>
    );
  }
};

const XenoCollapsible = (props: {
  readonly title: string;
  readonly children: React.JSX.Element | string;
}) => {
  const { data } = useBackend<Data>();
  const { title, children } = props;
  const { hive_color } = data;

  return (
    <Collapsible
      title={title}
      backgroundColor={!!hive_color && hive_color}
      color={!hive_color && 'xeno'}
      open
    >
      {children}
    </Collapsible>
  );
};

const QueenOviButtons = (props: { readonly target_ref: string }) => {
  const { act, data } = useBackend<Data>();
  const { target_ref } = props;

  return (
    <>
      <Flex.Item>
        <Button
          color="green"
          onClick={() =>
            act('heal', {
              target_ref: target_ref,
            })
          }
        >
          Вылечить
        </Button>
      </Flex.Item>
      <Flex.Item>
        <Button
          color="blue"
          onClick={() =>
            act('give_plasma', {
              target_ref: target_ref,
            })
          }
        >
          Передать плазму
        </Button>
      </Flex.Item>
    </>
  );
};
