import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { theme, mixins, media, Section } from '@styles';
const { colors, fontSizes, fonts, navDelay, loaderDelay } = theme;

const StyledContainer = styled(Section)`
  display: grid;
  grid-template-columns: minmax(0, 1.75fr) minmax(300px, 0.58fr);
  gap: 112px;
  min-height: 100vh;
  align-items: center;
  ${media.tablet`padding-top: 150px;`};
  ${media.tablet`
    grid-template-columns: 1fr;
    gap: 40px;
    align-items: flex-start;
  `};
`;
const StyledContent = styled.div`
  width: 100%;
  max-width: 1180px;
`;
const StyledPanel = styled.aside`
  ${mixins.boxShadow};
  position: relative;
  width: 100%;
  padding: 24px;
  border: 1px solid ${colors.lightestNavy};
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 30%),
    linear-gradient(135deg, rgba(37, 37, 37, 0.96), rgba(28, 28, 28, 0.98));
  overflow: hidden;
  transition: ${theme.transition};
  &:hover,
  &:focus-within {
    border-color: rgba(123, 160, 228, 0.28);
    background: linear-gradient(180deg, rgba(123, 160, 228, 0.07), transparent 35%),
      linear-gradient(135deg, rgba(41, 47, 60, 0.98), rgba(29, 31, 35, 0.98));
  }
  &:before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 22px 22px;
    opacity: 0.22;
    pointer-events: none;
  }
`;
const StyledPanelInner = styled.div`
  position: relative;
  z-index: 1;
`;
const StyledOverline = styled.h1`
  color: ${colors.green};
  margin: 0 0 18px 3px;
  font-size: ${fontSizes.md};
  font-family: ${fonts.SFMono};
  font-weight: normal;
  ${media.desktop`font-size: ${fontSizes.sm};`};
  ${media.tablet`font-size: ${fontSizes.smish};`};
`;
const StyledTitle = styled.h2`
  font-size: 90px;
  line-height: 1;
  margin: 0;
  ${media.desktop`font-size: 80px;`};
  ${media.tablet`font-size: 60px;`};
  ${media.phablet`font-size: 50px;`};
  ${media.phone`font-size: 40px;`};
`;
const StyledSubtitle = styled.h3`
  margin-top: 14px;
  max-width: 980px;
  font-size: 50px;
  line-height: 1.15;
  color: ${colors.lightSlate};
  ${media.desktop`font-size: 44px;`};
  ${media.tablet`font-size: 34px;`};
  ${media.phablet`font-size: 30px;`};
  ${media.phone`font-size: 26px;`};
`;
const StyledCommitGridLink = styled.a`
  display: block;
  width: 100%;
  margin-top: 42px;
  max-width: 1320px;
  overflow-x: auto;
`;
const StyledCommitSummary = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  color: ${colors.lightSlate};
  font-size: ${fontSizes.sm};
  line-height: 1.5;
`;
const StyledCommitMeta = styled.span`
  color: ${colors.slate};
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;
const StyledCommitShell = styled.div`
  display: inline-flex;
  flex-direction: column;
  gap: 10px;
  min-width: max-content;
`;
const StyledCommitMonths = styled.div`
  display: grid;
  grid-template-columns: 28px repeat(${props => props.columns}, 14px);
  column-gap: 4px;
  align-items: end;
  min-width: max-content;
`;
const StyledMonthLabel = styled.span`
  grid-column: ${props => props.column};
  color: ${colors.slate};
  font-size: ${fontSizes.xs};
  font-family: ${fonts.SFMono};
  white-space: nowrap;
`;
const StyledCommitBody = styled.div`
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  min-width: max-content;
`;
const StyledWeekdayLabels = styled.div`
  display: grid;
  grid-template-rows: repeat(7, 14px);
  gap: 4px;
  padding-top: 7px;
`;
const StyledWeekdayLabel = styled.span`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 28px;
  color: ${colors.slate};
  font-size: ${fontSizes.xxs};
  font-family: ${fonts.SFMono};
`;
const StyledCommitGrid = styled.div`
  display: inline-flex;
  gap: 4px;
  padding: 6px 0;
  min-width: max-content;
`;
const StyledWeek = styled.div`
  display: grid;
  grid-template-rows: repeat(7, 14px);
  gap: 4px;
`;
const StyledDay = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  cursor: pointer;
  background-color: ${props => {
    switch (props.level) {
      case 4:
        return '#39d353';
      case 3:
        return '#26a641';
      case 2:
        return '#006d32';
      case 1:
        return '#0e4429';
      default:
        return '#2a2a2a';
    }
  }};
  border: 1px solid rgba(255, 255, 255, 0.04);
`;
const StyledLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 14px;
`;
const StyledTooltip = styled.div`
  color: ${colors.lightSlate};
  font-size: ${fontSizes.sm};
  line-height: 1.5;
`;
const StyledLegendScale = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${colors.slate};
  font-size: ${fontSizes.xs};
  font-family: ${fonts.SFMono};
`;
const StyledLegendSwatches = styled.div`
  display: inline-flex;
  gap: 4px;
`;
const StyledLegendSwatch = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  background-color: ${props => {
    switch (props.level) {
      case 4:
        return '#39d353';
      case 3:
        return '#26a641';
      case 2:
        return '#006d32';
      case 1:
        return '#0e4429';
      default:
        return '#2a2a2a';
    }
  }};
`;
const StyledCtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 42px;
`;
const StyledPrimaryLink = styled.a`
  ${mixins.bigButton};
  font-weight: 700;
`;
const StyledSecondaryLink = styled.a`
  ${mixins.bigButton};
  font-weight: 700;
  background-color: ${colors.transGreen};
`;
const StyledSkillList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  padding: 0;
  margin: 42px 0 0;
  list-style: none;
`;
const StyledSkill = styled.li`
  color: ${colors.green};
  font-size: ${fontSizes.smish};
  font-family: ${fonts.SFMono};
`;
const StyledPanelLabel = styled.p`
  margin: 0 0 18px;
  color: ${colors.green};
  font-family: ${fonts.SFMono};
  font-size: ${fontSizes.sm};
`;
const StyledPanelHeading = styled.h4`
  margin: 0 0 24px;
  color: ${colors.lightestSlate};
  font-size: 26px;
`;
const StyledPanelList = styled.div`
  display: grid;
  gap: 14px;
`;
const StyledPanelCard = styled.a`
  display: block;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  background-color: rgba(255, 255, 255, 0.02);
  text-decoration: none;
  transition: ${theme.transition};
  &:hover,
  &:focus {
    transform: translateY(-3px);
    border-color: rgba(123, 160, 228, 0.35);
    background-color: rgba(123, 160, 228, 0.08);
  }
`;
const StyledPanelCardTitle = styled.h5`
  margin: 0;
  color: ${colors.lightestSlate};
  font-size: ${fontSizes.xl};
`;
const StyledPanelCardDescription = styled.p`
  margin: 10px 0 0;
  color: ${colors.lightSlate};
  line-height: 1.6;
`;
const StyledPanelCardStack = styled.p`
  margin: 12px 0 0;
  color: ${colors.green};
  font-size: ${fontSizes.smish};
  font-family: ${fonts.SFMono};
`;
const StyledPanelFooter = styled.p`
  margin: 22px 0 0;
  color: ${colors.slate};
  font-size: ${fontSizes.sm};
  a {
    ${mixins.inlineLink};
  }
`;

const Hero = ({ data }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [graph, setGraph] = useState({ rangeStart: '', rangeEnd: '', weeks: [] });
  const [activeDay, setActiveDay] = useState(null);
  const commitGridRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let isActive = true;

    fetch('/github-contributions.json')
      .then(response => response.json())
      .then(json => {
        if (isActive && json && Array.isArray(json.weeks)) {
          setGraph({
            rangeStart: json.rangeStart || '',
            rangeEnd: json.rangeEnd || '',
            weeks: json.weeks,
          });
        }
      })
      .catch(() => {
        if (isActive) {
          setGraph({ rangeStart: '', rangeEnd: '', weeks: [] });
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const { frontmatter } = data[0].node;
  const {
    title,
    name,
    subtitle,
    buttonText,
    buttonSecondaryText,
    skills,
    featuredItems,
  } = frontmatter;
  const { rangeStart, rangeEnd, weeks } = graph;
  const displayWeeks = [...weeks].reverse();
  const totalContributions = weeks.reduce(
    (sum, week) => sum + week.contributionDays.reduce((weekSum, day) => weekSum + day.count, 0),
    0,
  );
  const monthLabels = displayWeeks.reduce((labels, week, index) => {
    const monthLabel = new Date(week.firstDay).toLocaleDateString('en-US', { month: 'short' });
    const previous = labels[labels.length - 1];

    if (!previous || previous.label !== monthLabel) {
      labels.push({ label: monthLabel, column: index + 2 });
    }

    return labels;
  }, []);
  const defaultTooltip =
    rangeStart && rangeEnd
      ? `Showing contributions from ${new Date(rangeStart).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} to ${new Date(rangeEnd).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}.`
      : 'Showing the last year of GitHub contributions.';
  const tooltipText = activeDay
    ? `${new Date(activeDay.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} - ${activeDay.count} contribution${activeDay.count === 1 ? '' : 's'}`
    : defaultTooltip;
  const one = () => (
    <StyledContent style={{ transitionDelay: '100ms' }}>
      <StyledOverline>{title}</StyledOverline>
      <StyledTitle>{name}.</StyledTitle>
      <StyledSubtitle>{subtitle}</StyledSubtitle>
      <StyledCommitGridLink
        ref={commitGridRef}
        href="https://github.com/Sanketh23"
        target="_blank"
        rel="nofollow noopener noreferrer"
        aria-label="Sanketh23 GitHub profile">
        <StyledCommitSummary>
          <span>{totalContributions} contributions in the last year</span>
          <StyledCommitMeta>Live from GitHub</StyledCommitMeta>
        </StyledCommitSummary>
        <StyledCommitShell>
          <StyledCommitMonths columns={displayWeeks.length}>
            <span />
            {monthLabels.map(label => (
              <StyledMonthLabel key={`${label.label}-${label.column}`} column={label.column}>
                {label.label}
              </StyledMonthLabel>
            ))}
          </StyledCommitMonths>
          <StyledCommitBody>
            <StyledWeekdayLabels aria-hidden="true">
              <StyledWeekdayLabel />
              <StyledWeekdayLabel>Mon</StyledWeekdayLabel>
              <StyledWeekdayLabel />
              <StyledWeekdayLabel>Wed</StyledWeekdayLabel>
              <StyledWeekdayLabel />
              <StyledWeekdayLabel>Fri</StyledWeekdayLabel>
              <StyledWeekdayLabel />
            </StyledWeekdayLabels>
            <StyledCommitGrid>
              {displayWeeks.map((week, i) => (
                <StyledWeek key={`${week.firstDay}-${i}`}>
                  {week.contributionDays.map(day => (
                    <StyledDay
                      key={day.date}
                      level={day.level}
                      title={`${day.date}: ${day.count} contributions`}
                      onMouseEnter={() => setActiveDay(day)}
                      onFocus={() => setActiveDay(day)}
                      onMouseLeave={() => setActiveDay(null)}
                      onBlur={() => setActiveDay(null)}
                      tabIndex="0"
                    />
                  ))}
                </StyledWeek>
              ))}
            </StyledCommitGrid>
          </StyledCommitBody>
        </StyledCommitShell>
        <StyledLegend>
          <StyledTooltip>{tooltipText}</StyledTooltip>
          <StyledLegendScale>
            <span>Less</span>
            <StyledLegendSwatches aria-hidden="true">
              {[0, 1, 2, 3, 4].map(level => (
                <StyledLegendSwatch key={level} level={level} />
              ))}
            </StyledLegendSwatches>
            <span>More</span>
          </StyledLegendScale>
        </StyledLegend>
      </StyledCommitGridLink>
      <StyledCtaRow>
        <StyledPrimaryLink href="/resume.pdf" target="_blank" rel="noopener noreferrer">
          {buttonText}
        </StyledPrimaryLink>
        <StyledSecondaryLink href="/#projects">{buttonSecondaryText}</StyledSecondaryLink>
      </StyledCtaRow>
      <StyledSkillList>
        {skills && skills.map((skill, i) => <StyledSkill key={i}>{skill}</StyledSkill>)}
      </StyledSkillList>
    </StyledContent>
  );
  const two = () => (
    <StyledPanel style={{ transitionDelay: '200ms' }}>
      <StyledPanelInner>
        <StyledPanelLabel>Selected Work</StyledPanelLabel>
        <StyledPanelHeading>What I&apos;ve built recently</StyledPanelHeading>
        <StyledPanelList>
          {featuredItems &&
            featuredItems.map(({ title, description, stack, link }, i) => (
              <StyledPanelCard href={link} key={i}>
                <StyledPanelCardTitle>{title}</StyledPanelCardTitle>
                <StyledPanelCardDescription>{description}</StyledPanelCardDescription>
                <StyledPanelCardStack>{stack}</StyledPanelCardStack>
              </StyledPanelCard>
            ))}
        </StyledPanelList>
        <StyledPanelFooter>
          Focused on full-stack engineering, machine learning, and product development.
        </StyledPanelFooter>
      </StyledPanelInner>
    </StyledPanel>
  );

  const items = [one, two];

  return (
    <StyledContainer>
      <TransitionGroup component={null}>
        {isMounted &&
          items.map((item, i) => (
            <CSSTransition key={i} classNames="fadeup" timeout={loaderDelay}>
              {item}
            </CSSTransition>
          ))}
      </TransitionGroup>
    </StyledContainer>
  );
};

Hero.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Hero;
